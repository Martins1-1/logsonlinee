import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus, Trash2, Wallet, LogOut, BadgeCheck } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Basic user shape for typing localStorage data. Additional dynamic keys allowed as unknown.
interface User {
  id: string;
  email: string;
  name?: string;
  balance?: number;
  [key: string]: unknown;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 129.99,
    image: product1,
    description: "Premium noise-canceling headphones with 30hr battery",
    category: "Audio",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 299.99,
    image: product2,
    description: "Fitness tracker with heart rate monitor and GPS",
    category: "Wearables",
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    price: 79.99,
    image: product3,
    description: "Portable speaker with 360° sound and waterproof design",
    category: "Audio",
  },
  {
    id: "4",
    name: "Laptop Pro",
    price: 1299.99,
    image: product4,
    description: "High-performance laptop for work and creativity",
    category: "Computers",
  }
];

const Shop = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem("catalog_products");
    if (stored) {
      try {
        const parsed: Product[] = JSON.parse(stored);
        // basic shape validation
        if (Array.isArray(parsed)) return [...initialProducts, ...parsed];
      } catch (e) {
        // swallow JSON parse error silently
      }
    }
    return initialProducts;
  });
  
  // Load categories dynamically from localStorage (matches Admin catalog)
  const categories = ["All", ...((() => {
    try {
      const stored = localStorage.getItem("catalog_categories");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((cat: { id: string; name: string }) => cat.name);
        }
      }
    } catch (e) {
      // fallback to defaults
    }
    return ["Audio", "Wearables", "Computers", "Mobile", "Accessories", "Gaming", "Smart Home", "Storage", "Cameras", "Other"];
  })())];

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(currentUser) as User);
  }, [navigate]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) {
            toast.info("Item removed from cart");
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast.info("Item removed from cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Derive products to display based on active category
  const displayedProducts = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  const handleAddFunds = () => {
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const updatedUser: User = { ...user!, balance: (user?.balance || 0) + amount };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    const usersRaw = JSON.parse(localStorage.getItem("users") || "[]") as User[];
    const updatedUsers = usersRaw.map(u => u.id === user!.id ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    toast.success(`$${amount.toFixed(2)} added to your wallet`);
    setAddFundsAmount("");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user.balance || user.balance < cartTotal) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      return;
    }

    const updatedUser: User = { ...user!, balance: (user?.balance || 0) - cartTotal };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    const usersRaw = JSON.parse(localStorage.getItem("users") || "[]") as User[];
    const updatedUsers = usersRaw.map(u => u.id === user!.id ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    toast.success("Purchase successful! Thank you for shopping with us.");
    setCart([]);
    setShowCart(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    toast.info("Signed out successfully");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden pb-20 transition-colors duration-300">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-pink-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      
      <Navbar isShopPage cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      
      <div className="pt-24 px-6 relative z-10">
        <div className="container mx-auto">
          {/* Welcome Message */}
          <div className="flex items-center justify-end mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg border-2 border-white/60 dark:bg-gray-900/80 dark:border-gray-800">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {user.name || user.email.split('@')[0]}
              </span>
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400 font-semibold">welcome back</span>
            </div>
          </div>
          
          {/* Header Section */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
            <h1 
              className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
              style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
            >
              Shop Premium Products
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">Discover our curated collection of high-quality social media accounts</p>
          </div>

          {/* Wallet Section */}
          <Card className="mb-8 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-2 border-white/60 dark:border-gray-800 animate-in fade-in slide-in-from-left duration-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">Your Wallet</CardTitle>
                    <CardDescription className="text-lg font-semibold text-gray-700 dark:text-gray-300">Current balance: <span className="text-green-600">${(user.balance || 0).toFixed(2)}</span></CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 transition-all duration-300 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <Button 
                  onClick={handleAddFunds}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products and Cart */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products Grid */}
            <div className="lg:col-span-2">
              <h2 
                className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
                style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
              >
                Our Products
              </h2>
              {/* Category Filters */}
              <div className="flex flex-wrap gap-3 mb-8 animate-in fade-in slide-in-from-left duration-500">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 shadow ${activeCategory === cat ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-white/70 backdrop-blur border-2 border-white/60 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:bg-gray-900/70 dark:border-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-800 dark:text-gray-300'}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="space-y-4">
                {displayedProducts.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="bg-white/90 backdrop-blur-xl shadow-lg border-2 border-white/60 hover:shadow-xl transition-all duration-300 group animate-in fade-in slide-in-from-bottom dark:bg-gray-900/90 dark:border-gray-800"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Small Product Image */}
                        <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300 z-10"></div>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <Badge variant="outline" className="px-2 py-0.5 text-xs tracking-wide bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-none flex-shrink-0 dark:from-blue-950 dark:to-purple-950 dark:text-blue-400">
                              {product.category}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
                        </div>
                        
                        {/* Price and Add to Cart */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge className="text-lg px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bold">
                            ${product.price}
                          </Badge>
                          <Button 
                            onClick={() => addToCart(product)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-white/90 backdrop-blur-xl shadow-2xl border-2 border-white/60 animate-in fade-in slide-in-from-right duration-700 dark:bg-gray-900/90 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    Shopping Cart
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-600 dark:text-gray-400">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Your cart is empty</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 group">
                          <div className="relative overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all duration-300"></div>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200">{item.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                              ${item.price} × {item.quantity}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-lg border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-blue-400"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-bold w-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-lg border-2 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-purple-400"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 ml-auto rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 dark:hover:bg-red-950 dark:hover:text-red-400"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                {cart.length > 0 && (
                  <CardFooter className="flex-col gap-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-b-xl">
                    <div className="w-full flex justify-between text-xl font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Total:</span>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl transform hover:scale-[1.02]" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={!user.balance || user.balance < cartTotal}
                    >
                      {user.balance >= cartTotal ? "Checkout Now" : "Insufficient Balance"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Social Support Icons */}
      <div className="fixed bottom-8 left-6 z-50">
        <a
          href="https://chat.whatsapp.com/Jyr22tl4NNA6GJ5dXIpAlv?mode=wwt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
          aria-label="Contact us on WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>

      <div className="fixed bottom-8 right-6 z-50">
        <a
          href="https://t.me/@Legit_support1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
          aria-label="Contact us on Telegram"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-2 py-1 rounded-full shadow">online agent</span>
        </a>
      </div>
    </div>
  );
};

export default Shop;
