import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import axios from "axios";
import { User, Admin, Cart, Payment, Product, CatalogProduct, PurchaseHistory, CatalogCategory } from "./models";
import paymentsRouter from "./routes/payments";

dotenv.config();

const app = express();
// allow CORS from local dev and a production frontend URL set via env
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:8080";
app.use(cors({
  origin: [
    FRONTEND_URL, 
    'https://legitstorez.com',
    'https://www.legitstorez.com',
    'https://legitstore.vercel.app',
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://localhost:4001', 
    'http://localhost:4000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Payment routes (Ercaspay integration)
app.use("/api/payments", paymentsRouter);

const PORT = parseInt(process.env.PORT || "4000", 10);
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/joybuy";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || "";

// We'll start the server after connecting to MongoDB (so startup failures surface immediately)

type JwtAdminPayload = {
  adminId: string;
  email?: string;
  iat?: number;
  exp?: number;
};

type AdminRequest = Request & { admin?: JwtAdminPayload };

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization" });
  const parts = auth.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtAdminPayload;
    if (!payload || !payload.adminId) return res.status(403).json({ error: "Not authorized" });
    // attach to request object in a type-safe way
  (req as AdminRequest).admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function start() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected successfully");
    
    // Seed default categories if none exist
    const categoryCount = await CatalogCategory.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { id: "audio", name: "Audio" },
        { id: "wearables", name: "Wearables" },
        { id: "computers", name: "Computers" },
        { id: "mobile", name: "Mobile" },
        { id: "accessories", name: "Accessories" },
        { id: "gaming", name: "Gaming" },
        { id: "smart-home", name: "Smart Home" },
        { id: "storage", name: "Storage" },
        { id: "cameras", name: "Cameras" },
        { id: "other", name: "Other" },
      ];
      await CatalogCategory.insertMany(defaultCategories);
      console.log("Default categories seeded to database");
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on all interfaces, port ${PORT}`);
      console.log(`Try accessing: http://localhost:${PORT}/api/health`);
    }).on('error', (error: Error) => {
      console.error("Failed to start server:", error);
      console.error("Port:", PORT);
      console.error("Error details:", error.message);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// Admin login
app.post("/api/admin/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    const admin = await Admin.findOne({ email }).exec();
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ adminId: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// User registration
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) return res.status(400).json({ error: "Email already registered" });
    
    // Hash password (8 rounds = faster but still secure)
    const hashedPassword = await bcrypt.hash(password, 8);
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || undefined,
      balance: 0
    });
    
    res.json({ 
      ok: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        balance: user.balance 
      } 
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// User login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    
    const user = await User.findOne({ email }).exec();
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    
    res.json({ 
      ok: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        balance: user.balance 
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Users
app.get("/api/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log("Fetching users...");
    const users = await User.find().lean();
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/users/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await User.findById(id).lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  const carts = await Cart.find({ user: user._id }).lean();
  const payments = await Payment.find({ user: user._id }).lean();
  res.json({ ...user, carts, payments });
});

app.delete("/api/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Delete associated data
    await Cart.deleteMany({ user: user._id });
    await Payment.deleteMany({ user: user._id });
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.json({ ok: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Payments
app.get("/api/payments", requireAdmin, async (req: Request, res: Response) => {
  const payments = await Payment.find().populate("user").lean();
  res.json(payments);
});

app.delete("/api/payments/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    
    await Payment.findByIdAndDelete(id);
    
    res.json({ ok: true, message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Error deleting payment:", err);
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

// Carts
app.get("/api/carts", requireAdmin, async (req: Request, res: Response) => {
  const carts = await Cart.find().populate("user").lean();
  res.json(carts);
});

// Products
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await Product.find().lean();
    // Hide items from non-admin users
    const isAdmin = req.headers.authorization?.startsWith("Bearer ");
    if (!isAdmin) {
      // Remove items array for regular users
      const sanitized = products.map(p => ({ ...p, items: [] }));
      return res.json(sanitized);
    }
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, imageUrl } = req.body;
    if (!name || !price) return res.status(400).json({ error: "Name and price are required" });
    
    const product = await Product.create({
      name,
      price,
      description,
      category,
      imageUrl,
      items: []
    });
    
    res.json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put("/api/products/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, imageUrl } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description, category, imageUrl },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Product Items (account credentials)
app.post("/api/products/:id/items", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { username, password, twoFactorAuth, emailAddress, recoveryPassword } = req.body;
    if (!username || !password || !emailAddress) {
      return res.status(400).json({ error: "Username, password, and email are required" });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    product.items.push({
      username,
      password,
      twoFactorAuth,
      emailAddress,
      recoveryPassword,
      isSold: false
    });
    
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.delete("/api/products/:productId/items/:itemId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    product.items = product.items.filter(item => item._id?.toString() !== req.params.itemId);
    await product.save();
    
    res.json({ ok: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.patch("/api/products/:productId/items/:itemId/sold", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { isSold } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const item = product.items.find(item => item._id?.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });
    
    item.isSold = isSold;
    if (!isSold) {
      item.soldTo = undefined;
      item.soldAt = undefined;
    }
    
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error updating item status:", err);
    res.status(500).json({ error: "Failed to update item status" });
  }
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  console.log("Health check endpoint hit");
  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ status: states[state] || "unknown", uptime: process.uptime() });
});

// ======== CATALOG PRODUCT ENDPOINTS ========

// Get all catalog products
app.get("/api/catalog", async (req: Request, res: Response) => {
  try {
    const products = await CatalogProduct.find().lean();
    res.json(products);
  } catch (err) {
    console.error("Error fetching catalog products:", err);
    res.status(500).json({ error: "Failed to fetch catalog products" });
  }
});

// Create catalog product (admin only)
app.post("/api/catalog", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, name, description, price, image, category } = req.body;
    if (!id || !name || !description || !price || !image || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const product = new CatalogProduct({
      id,
      name,
      description,
      price,
      image,
      category,
      serialNumbers: [],
    });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error creating catalog product:", err);
    res.status(500).json({ error: "Failed to create catalog product" });
  }
});

// Update catalog product (admin only)
app.put("/api/catalog/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await CatalogProduct.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error updating catalog product:", err);
    res.status(500).json({ error: "Failed to update catalog product" });
  }
});

// Delete catalog product (admin only)
app.delete("/api/catalog/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await CatalogProduct.findOneAndDelete({ id });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting catalog product:", err);
    res.status(500).json({ error: "Failed to delete catalog product" });
  }
});

// ======== CATALOG CATEGORY ENDPOINTS ========

// Get all categories
app.get("/api/catalog-categories", async (req: Request, res: Response) => {
  try {
    const cats = await CatalogCategory.find().sort({ name: 1 }).lean();
    res.json(cats);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Create category (admin)
app.post("/api/catalog-categories", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body as { id?: string; name?: string };
    if (!name) return res.status(400).json({ error: "Name is required" });
    const cat = new CatalogCategory({ id: id || crypto.randomUUID(), name });
    await cat.save();
    res.json(cat);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Delete category (admin)
app.delete("/api/catalog-categories/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await CatalogCategory.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// ======== PURCHASE HISTORY ENDPOINTS ========

// Get purchase history for a user
app.get("/api/purchase-history/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const history = await PurchaseHistory.find({ userId }).sort({ purchaseDate: -1 }).lean();
    res.json(history);
  } catch (err) {
    console.error("Error fetching purchase history:", err);
    res.status(500).json({ error: "Failed to fetch purchase history" });
  }
});

// Create purchase history entry
app.post("/api/purchase-history", async (req: Request, res: Response) => {
  try {
    const { userId, email, productId, name, description, price, image, category, quantity, assignedSerials } = req.body;
    if (!userId || !email || !productId || !name || !price || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const purchase = new PurchaseHistory({
      userId,
      email,
      productId,
      name,
      description,
      price,
      image,
      category,
      quantity,
      assignedSerials: assignedSerials || [],
    });
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    console.error("Error creating purchase history:", err);
    res.status(500).json({ error: "Failed to create purchase history" });
  }
});

// Get all purchase history (admin only)
app.get("/api/purchase-history", requireAdmin, async (req: Request, res: Response) => {
  try {
    const history = await PurchaseHistory.find().sort({ purchaseDate: -1 }).lean();
    res.json(history);
  } catch (err) {
    console.error("Error fetching all purchase history:", err);
    res.status(500).json({ error: "Failed to fetch purchase history" });
  }
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  console.log("Health check endpoint hit");
  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ ok: state === 1, mongoState: states[state] ?? state, uptime: process.uptime() });
  console.log("Health check response sent");
});


// Initialize Paystack transaction
app.post("/api/payments/initialize", async (req: Request, res: Response) => {
  const { amount, email, userId } = req.body;
  if (!amount || !email || !userId) return res.status(400).json({ error: "Missing fields" });
  const reference = `ref_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  try {
    // create pending payment record
    const payment = await Payment.create({ user: userId, amount, method: "card", status: "pending", reference });
    // call Paystack initialize
    const resp = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: Math.round(amount * 100), reference },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    res.json({ authorization_url: resp.data.data.authorization_url, reference, paymentId: payment._id });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(err.response?.data ?? err.message);
    } else if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

// Verify Paystack transaction
// Robust verification endpoint: accepts path or various query param names (reference, pref, ref, transRef)
app.get("/api/payments/verify/:reference?", async (req: Request, res: Response) => {
  const passed = req.params.reference
    || (req.query.reference as string | undefined)
    || (req.query.pref as string | undefined)
    || (req.query.ref as string | undefined)
    || (req.query.transRef as string | undefined);
  if (!passed) return res.status(400).json({ error: "Missing reference" });
  try {
    // Call Paystack with whatever reference we were given
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${passed}`, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } });
    const { status, amount } = resp.data.data; // amount in kobo

    // Attempt to locate Payment by internal reference first, then by transactionReference
    let payment = await Payment.findOne({ reference: passed }).exec();
    if (!payment) {
      payment = await Payment.findOne({ transactionReference: passed }).exec();
    }

    if (!payment) {
      // No payment record, still return status so client can decide next step
      return res.json({ ok: true, status, amount: amount / 100, newBalance: undefined, paymentFound: false });
    }

    // Update status
    payment.status = status === "success" ? "completed" : status;

    let newBalance: number | undefined = undefined;
    if (payment.status === "completed" && !payment.isCredited && payment.user) {
      const creditedAmount = amount / 100;
      const updatedUser = await User.findByIdAndUpdate(payment.user, { $inc: { balance: creditedAmount } }, { new: true }).exec();
      if (updatedUser) {
        newBalance = updatedUser.balance || 0;
        payment.isCredited = true;
      }
    }
    await payment.save();
    res.json({ ok: true, status: payment.status, amount: amount / 100, newBalance, alreadyCredited: payment.isCredited, paymentFound: true });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Paystack verify error:", err.response?.data ?? err.message);
      return res.status(500).json({ error: "Verification failed", details: err.response?.data ?? err.message });
    } else if (err instanceof Error) {
      console.error("Verify error:", err.message);
      return res.status(500).json({ error: "Verification failed", details: err.message });
    } else {
      console.error("Unknown verify error:", err);
      return res.status(500).json({ error: "Verification failed" });
    }
  }
});

// Start the server (after connecting to MongoDB)
start();
