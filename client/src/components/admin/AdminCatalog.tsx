import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Package, Image as ImageIcon, Database, Hash, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { catalogAPI } from "@/lib/api";

interface SerialNumber {
  id: string;
  serial: string;
  isUsed: boolean;
  usedBy?: string; // user email
  usedAt?: string;
}

interface CatalogCategory {
  id: string;
  name: string;
  createdAt: string;
}

interface CatalogProduct {
  id: string;
  name: string;
  category: string; // category NAME stored to align with Shop filters
  description: string;
  price: number;
  image: string;
  serialNumbers?: SerialNumber[]; // Array of serial numbers
  createdAt?: string; // Made optional to match API response
}

const CATEGORIES_KEY = "catalog_categories";
const PRODUCTS_KEY = "catalog_products";

// Pre-defined categories matching Shop page filters
const defaultCategories: CatalogCategory[] = [
  { id: "audio", name: "Audio", createdAt: new Date().toISOString() },
  { id: "wearables", name: "Wearables", createdAt: new Date().toISOString() },
  { id: "computers", name: "Computers", createdAt: new Date().toISOString() },
  { id: "mobile", name: "Mobile", createdAt: new Date().toISOString() },
  { id: "accessories", name: "Accessories", createdAt: new Date().toISOString() },
  { id: "gaming", name: "Gaming", createdAt: new Date().toISOString() },
  { id: "smart-home", name: "Smart Home", createdAt: new Date().toISOString() },
  { id: "storage", name: "Storage", createdAt: new Date().toISOString() },
  { id: "cameras", name: "Cameras", createdAt: new Date().toISOString() },
  { id: "other", name: "Other", createdAt: new Date().toISOString() },
];

export default function AdminCatalog() {
  const [categories, setCategories] = useState<CatalogCategory[]>(() => {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* fallback to default */ }
    }
    // Initialize with defaults on first load
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  });
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form state
  const [newCategoryName, setNewCategoryName] = useState("");

  // Product form state
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState<string>("");
  const [pDescription, setPDescription] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImage, setPImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Serial number management
  const [serialDialogOpen, setSerialDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [newSerial, setNewSerial] = useState("");

  // Derived lookup
  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]);

  // Fetch products from MongoDB on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await catalogAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)); }, [categories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPImage(base64String);
      setUploadingImage(false);
      toast.success("Image uploaded successfully");
    };

    reader.onerror = () => {
      toast.error("Failed to upload image");
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) { toast.error("Category name required"); return; }
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) { toast.error("Category already exists"); return; }
    const cat: CatalogCategory = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    setCategories(prev => [...prev, cat]);
    setNewCategoryName("");
    toast.success("Category added");
  };

  const removeCategory = async (id: string) => {
    // also remove products in that category (by name)
    const name = categoryMap[id];
    const productsToDelete = products.filter(p => p.category === name);
    
    try {
      // Delete products from MongoDB
      for (const product of productsToDelete) {
        await catalogAPI.delete(product.id);
      }
      
      setProducts(prev => prev.filter(p => p.category !== name));
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.info("Category removed");
    } catch (error) {
      console.error("Error removing category:", error);
      toast.error("Failed to remove category");
    }
  };

  const addProduct = async () => {
    if (!pName.trim() || !pDescription.trim()) { toast.error("Name & description required"); return; }
    if (!pCategory) { toast.error("Select a category"); return; }
    const price = parseFloat(pPrice);
    if (isNaN(price) || price <= 0) { toast.error("Enter valid price"); return; }
    if (!pImage.trim()) { toast.error("Please upload an image"); return; }

    const prod = {
      id: crypto.randomUUID(),
      name: pName.trim(),
      category: categoryMap[pCategory] || "",
      description: pDescription.trim(),
      price,
      image: pImage.trim(),
      serialNumbers: [],
    };
    
    try {
      const created = await catalogAPI.create(prod);
      setProducts(prev => [...prev, created]);
      setPName(""); setPCategory(""); setPDescription(""); setPPrice(""); setPImage("");
      toast.success("Product added and saved");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await catalogAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.info("Product removed");
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product");
    }
  };

  const openSerialDialog = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setSerialDialogOpen(true);
  };

  const addSerialNumber = async () => {
    if (!selectedProduct || !newSerial.trim()) {
      toast.error("Serial number required");
      return;
    }

    // Check if serial already exists in this product
    if (selectedProduct.serialNumbers?.some(s => s.serial === newSerial.trim())) {
      toast.error("Serial number already exists");
      return;
    }

    const serial: SerialNumber = {
      id: crypto.randomUUID(),
      serial: newSerial.trim(),
      isUsed: false,
    };

    const updatedSerials = [...(selectedProduct.serialNumbers || []), serial];
    
    try {
      await catalogAPI.update(selectedProduct.id, { serialNumbers: updatedSerials });
      
      setProducts(prev => prev.map(p => {
        if (p.id === selectedProduct.id) {
          return {
            ...p,
            serialNumbers: updatedSerials
          };
        }
        return p;
      }));

      setSelectedProduct(prev => prev ? { ...prev, serialNumbers: updatedSerials } : null);
      setNewSerial("");
      toast.success("Serial number added");
    } catch (error) {
      console.error("Error adding serial number:", error);
      toast.error("Failed to add serial number");
    }
  };

  const removeSerialNumber = async (productId: string, serialId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedSerials = (product.serialNumbers || []).filter(s => s.id !== serialId);
    
    try {
      await catalogAPI.update(productId, { serialNumbers: updatedSerials });
      
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            serialNumbers: updatedSerials
          };
        }
        return p;
      }));
      
      if (selectedProduct?.id === productId) {
        setSelectedProduct(prev => prev ? { ...prev, serialNumbers: updatedSerials } : null);
      }
      
      toast.info("Serial number removed");
    } catch (error) {
      console.error("Error removing serial number:", error);
      toast.error("Failed to remove serial number");
    }
  };

  const toggleSerialUsed = async (productId: string, serialId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedSerials = (product.serialNumbers || []).map(s => {
      if (s.id === serialId) {
        return { ...s, isUsed: !s.isUsed, usedBy: s.isUsed ? undefined : "Manual", usedAt: s.isUsed ? undefined : new Date().toISOString() };
      }
      return s;
    });
    
    try {
      await catalogAPI.update(productId, { serialNumbers: updatedSerials });
      
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            serialNumbers: updatedSerials
          };
        }
        return p;
      }));
      
      if (selectedProduct?.id === productId) {
        setSelectedProduct(prev => prev ? { ...prev, serialNumbers: updatedSerials } : null);
      }
      
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating serial status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <Card className="bg-white/90 backdrop-blur border-2 border-white/60 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"><Database className="h-6 w-6 text-white" /></div>
              <div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">Catalog Manager</CardTitle>
                <CardDescription>Manage categories and products stored locally</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-blue-600" /> Categories</h3>
              <div className="flex gap-2">
                <Input placeholder="New category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="h-11" />
                <Button onClick={addCategory} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-11 px-6">Add</Button>
              </div>
              {categories.length === 0 && <p className="text-sm text-gray-500">No categories yet.</p>}
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="group relative">
                    <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow cursor-default flex items-center gap-2">
                      {cat.name}
                      <button
                        onClick={() => removeCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-white/80 hover:text-white"
                        aria-label="Remove category"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-purple-600" /> Add Product</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Name" value={pName} onChange={e => setPName(e.target.value)} />
                <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="border rounded-md px-3 py-2 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Input placeholder="Price" type="number" min="0" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} />
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="cursor-pointer"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-md">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                    </div>
                  )}
                </div>
                {pImage && (
                  <div className="md:col-span-2">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img src={pImage} alt="Preview" className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800" />
                      <button
                        onClick={() => setPImage("")}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Textarea placeholder="Description" value={pDescription} onChange={e => setPDescription(e.target.value)} className="min-h-[100px]" />
                </div>
              </div>
              <Button onClick={addProduct} disabled={uploadingImage} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow px-8">
                <Plus className="h-4 w-4 mr-2" /> Save Product
              </Button>
            </div>

            {/* Product List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-pink-600" /> Products ({products.length})</h3>
              {products.length === 0 && <p className="text-sm text-gray-500">No products yet.</p>}
              <div className="space-y-3">
                {products.map(prod => {
                  const availableSerials = (prod.serialNumbers || []).filter(s => !s.isUsed).length;
                  const usedSerials = (prod.serialNumbers || []).filter(s => s.isUsed).length;
                  
                  return (
                  <Card key={prod.id} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-2 border-white/60 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Category Badge */}
                        <Badge variant="outline" className="px-2 py-0.5 text-xs tracking-wide bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 text-blue-700 dark:text-blue-400 border-none flex-shrink-0">
                          {prod.category}
                        </Badge>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 truncate">{prod.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{prod.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200">
                              <Hash className="h-3 w-3 mr-1" />
                              {availableSerials} Available
                            </Badge>
                            {usedSerials > 0 && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-200">
                                {usedSerials} Used
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Price and Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className="text-base px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bold">
                            ₦{prod.price.toFixed(2)}
                          </Badge>
                          <button
                            onClick={() => openSerialDialog(prod)}
                            className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                            aria-label="Manage serial numbers"
                          >
                            <Hash className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeProduct(prod.id)}
                            className="bg-red-50 dark:bg-red-950 rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                            aria-label="Remove product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
          </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-500">Data persisted locally in browser storage. Integrate API later for persistence.</CardFooter>
        </Card>
      </section>

      {/* Serial Number Management Dialog */}
      <Dialog open={serialDialogOpen} onOpenChange={setSerialDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Manage Serial Numbers - {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Add serial numbers that will be assigned to customers after purchase. Each unit sold will receive one unique serial number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Serial Form */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter serial number"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSerialNumber()}
                className="font-mono"
              />
              <Button onClick={addSerialNumber} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Serial Numbers List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">
                  Serial Numbers ({selectedProduct?.serialNumbers?.length || 0})
                </h4>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {selectedProduct?.serialNumbers?.filter(s => !s.isUsed).length || 0} Available
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    {selectedProduct?.serialNumbers?.filter(s => s.isUsed).length || 0} Used
                  </Badge>
                </div>
              </div>

              {(!selectedProduct?.serialNumbers || selectedProduct.serialNumbers.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No serial numbers yet. Add some above.</p>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedProduct?.serialNumbers?.map(serial => (
                  <div
                    key={serial.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                      serial.isUsed
                        ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-mono font-semibold text-sm">{serial.serial}</p>
                      {serial.isUsed && serial.usedBy && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Used by: {serial.usedBy} {serial.usedAt && `on ${new Date(serial.usedAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {serial.isUsed ? (
                        <Badge className="bg-gray-500">Used</Badge>
                      ) : (
                        <Badge className="bg-green-600">Available</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectedProduct && toggleSerialUsed(selectedProduct.id, serial.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        {serial.isUsed ? "Mark Available" : "Mark Used"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectedProduct && removeSerialNumber(selectedProduct.id, serial.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSerialDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
