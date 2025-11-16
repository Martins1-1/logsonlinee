import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import axios from "axios";
import { User, Admin, Cart, Payment } from "./models";
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
app.get("/api/payments/verify/:reference", async (req: Request, res: Response) => {
  const { reference } = req.params;
  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } });
    const { status, amount } = resp.data.data;
    const payment = await Payment.findOneAndUpdate({ reference }, { status: status === "success" ? "completed" : status }).exec();
    res.json({ ok: true, status: resp.data.data.status, amount: resp.data.data.amount / 100 });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(err.response?.data ?? err.message);
    } else if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    res.status(500).json({ error: "Verification failed" });
  }
});

// Start the server (after connecting to MongoDB)
start();
