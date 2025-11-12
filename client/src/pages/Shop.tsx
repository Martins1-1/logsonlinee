import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Wallet, LogOut, BadgeCheck, X } from "lucide-react";
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
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
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

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setShowBuyDialog(true);
  };

  const handleCancelPurchase = () => {
    setShowBuyDialog(false);
    setSelectedProduct(null);
  };

  const handleConfirmPurchase = () => {
    if (!selectedProduct || !user) return;

    if (!user.balance || user.balance < selectedProduct.price) {
      toast.error("Insufficient balance. Please add funds to your wallet.");
      setShowBuyDialog(false);
      setSelectedProduct(null);
      return;
    }

    const updatedUser: User = { ...user, balance: (user.balance || 0) - selectedProduct.price };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    const usersRaw = JSON.parse(localStorage.getItem("users") || "[]") as User[];
    const updatedUsers = usersRaw.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    toast.success(`Purchase successful! You bought ${selectedProduct.name}`);
    setShowBuyDialog(false);
    setSelectedProduct(null);
  };

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
    
    toast.success(`₦${amount.toFixed(2)} added to your wallet`);
    setAddFundsAmount("");
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
      
      <Navbar isShopPage cartItemCount={0} />
      
      <div className="pt-24 relative z-10">
        <div className="px-6">
          <div className="container mx-auto">
            {/* Welcome Message */}
            <div className="flex items-center justify-end mb-4 md:mb-6 animate-in fade-in slide-in-from-top duration-500">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-lg px-3 md:px-6 py-2 md:py-3 rounded-full shadow-lg border-2 border-white/60 dark:bg-gray-900/80 dark:border-gray-800">
                <span className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
                <BadgeCheck className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <span className="text-xs md:text-base text-gray-600 dark:text-gray-400 font-semibold">welcome back</span>
              </div>
            </div>
            
            {/* Header Section */}
            <div className="text-center mb-8 md:mb-12 animate-in fade-in slide-in-from-top duration-700">
              <h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
                style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
              >
                Shop Premium Products
              </h1>
              <p className="text-sm md:text-xl text-gray-700 dark:text-gray-300">Discover our curated collection of high-quality social media accounts</p>
            </div>

            {/* Wallet Section */}
            <Card className="mb-6 md:mb-8 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-2 border-white/60 dark:border-gray-800 animate-in fade-in slide-in-from-left duration-700">
              <CardHeader className="pb-3 md:pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">Your Wallet</CardTitle>
                      <CardDescription className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-300">Balance: <span className="text-green-600">₦{(user.balance || 0).toFixed(2)}</span></CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut} 
                    className="hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center gap-2 text-sm md:text-base h-9 md:h-auto"
                  >
                    <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="h-10 md:h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 transition-all duration-300 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                  />
                  <Button 
                    onClick={handleAddFunds}
                    className="h-10 md:h-12 px-4 md:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-sm md:text-base w-full sm:w-auto"
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Add Funds
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products Section - Full Width on Mobile */}
        <div className="px-0 md:px-6">
          <div className="container mx-auto">
            {/* Products and Buy Dialog */}
            <div className="grid lg:grid-cols-1 gap-8">
              {/* Products Grid */}
              <div className="lg:col-span-1">
                <h2 
                  className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 px-3 md:px-0"
                  style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
                >
                  Our Products
                </h2>
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8 animate-in fade-in slide-in-from-left duration-500 px-3 md:px-0">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-semibold transition-all duration-300 shadow ${activeCategory === cat ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-white/70 backdrop-blur border-2 border-white/60 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:bg-gray-900/70 dark:border-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-800 dark:text-gray-300'}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
                <div className="space-y-3 md:space-y-4">
                {displayedProducts.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="bg-white/90 backdrop-blur-xl shadow-lg border-2 border-l-0 border-r-0 md:border-l-2 md:border-r-2 border-white/60 hover:shadow-xl transition-all duration-300 group animate-in fade-in slide-in-from-bottom dark:bg-gray-900/90 dark:border-gray-800 mx-0 rounded-none md:rounded-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4 md:p-4">
                        {/* Top Section: Image and Info (Mobile Full Width) */}
                        <div className="flex items-start gap-3 p-3 md:p-0 md:flex-1">
                          {/* Small Product Image */}
                          <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300 z-10"></div>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-0.5 md:mb-1">
                              <Badge variant="outline" className="px-1.5 md:px-2 py-0.5 text-xs tracking-wide bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-none flex-shrink-0 dark:from-blue-950 dark:to-purple-950 dark:text-blue-400">
                                {product.category}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-sm md:text-base lg:text-lg mb-0.5 md:mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 truncate md:whitespace-normal">{product.name}</h3>
                          </div>
                        </div>
                        
                        {/* Description Section (Full Width on Mobile) */}
                        <div className="px-3 pb-2 md:p-0 md:flex-1">
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-3 md:line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>
                        
                        {/* Price and Buy Button (Full Width on Mobile, Fixed to Edges) */}
                        <div className="flex items-center justify-between gap-2 px-3 pb-3 md:p-0 md:flex-shrink-0 md:flex-col md:gap-2 border-t md:border-t-0 border-gray-200 dark:border-gray-800 pt-2 md:pt-0">
                          <Badge className="text-xs md:text-sm lg:text-base px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bold whitespace-nowrap">
                            ₦{product.price}
                          </Badge>
                          <Button 
                            onClick={() => handleBuyClick(product)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg h-8 md:h-9 px-3 md:px-3 text-xs md:text-sm"
                          >
                            <span className="mr-1">₦</span>
                            Buy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Buy Confirmation Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-white/60 dark:border-gray-800 p-4 md:p-6">
          <DialogHeader className="pb-2 md:pb-4">
            <DialogTitle className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Confirm Purchase
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              Review the product details below before completing your purchase.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-3 md:space-y-4 py-2 md:py-4">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-xl"
                  />
                </div>
              </div>
              
              {/* Product Details */}
              <div className="space-y-2 md:space-y-3">
                <div>
                  <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedProduct.name}
                  </h3>
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 text-blue-700 dark:text-blue-400 border-none">
                    {selectedProduct.category}
                  </Badge>
                </div>
                
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedProduct.description}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-300">Price:</span>
                  <Badge className="text-sm md:text-lg px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-green-500 to-emerald-500 font-bold">
                    ₦{selectedProduct.price}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Your Balance:</span>
                  <span className="text-xs md:text-sm font-bold text-green-600 dark:text-green-400">
                    ₦{(user?.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Confirmation Message */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-center text-xs md:text-sm font-medium text-blue-900 dark:text-blue-300">
                  Do you want to pay for this item?
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-row gap-2 md:gap-3 pt-2 md:pt-4 sticky bottom-0 bg-white/95 dark:bg-gray-900/95 -mx-4 md:-mx-6 px-4 md:px-6 pb-0">
            <Button
              variant="outline"
              onClick={handleCancelPurchase}
              className="flex-1 h-10 md:h-11 text-sm md:text-base border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold"
            >
              <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={!user?.balance || user.balance < (selectedProduct?.price || 0)}
              className="flex-1 h-10 md:h-11 text-sm md:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-1 md:mr-2">₦</span>
              {user?.balance && selectedProduct && user.balance >= selectedProduct.price ? "Continue" : "Insufficient Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
