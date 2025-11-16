import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductItem = {
  _id: string;
  username: string;
  password: string;
  twoFactorAuth?: string;
  emailAddress: string;
  recoveryPassword?: string;
  isSold: boolean;
  soldTo?: string;
  soldAt?: string;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  items: ProductItem[];
  createdAt: string;
};

export default function ProductsTable({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [newItem, setNewItem] = useState({
    username: "",
    password: "",
    twoFactorAuth: "",
    emailAddress: "",
    recoveryPassword: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateProduct = async () => {
    if (!editingProduct.name || !editingProduct.price) {
      toast({ title: "Error", description: "Name and price are required", variant: "destructive" });
      return;
    }

    try {
      if (editingProduct._id) {
        await apiFetch(`/products/${editingProduct._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(editingProduct),
        });
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        await apiFetch("/products", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(editingProduct),
        });
        toast({ title: "Success", description: "Product created successfully" });
      }
      setProductDialogOpen(false);
      setEditingProduct({});
      fetchProducts();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product and all its items?")) return;
    
    try {
      await apiFetch(`/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Success", description: "Product deleted" });
      fetchProducts();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleAddItem = async () => {
    if (!selectedProduct || !newItem.username || !newItem.password || !newItem.emailAddress) {
      toast({ title: "Error", description: "Username, password, and email are required", variant: "destructive" });
      return;
    }

    try {
      await apiFetch(`/products/${selectedProduct._id}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      toast({ title: "Success", description: "Item added successfully" });
      setItemDialogOpen(false);
      setNewItem({ username: "", password: "", twoFactorAuth: "", emailAddress: "", recoveryPassword: "" });
      fetchProducts();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleDeleteItem = async (productId: string, itemId: string) => {
    if (!confirm("Delete this item?")) return;
    
    try {
      await apiFetch(`/products/${productId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Success", description: "Item deleted" });
      fetchProducts();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleToggleSold = async (productId: string, itemId: string, isSold: boolean) => {
    try {
      await apiFetch(`/products/${productId}/items/${itemId}/sold`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isSold: !isSold }),
      });
      toast({ title: "Success", description: isSold ? "Marked as available" : "Marked as sold" });
      fetchProducts();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading products...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Products ({products.length})
        </h2>
        <Button
          onClick={() => {
            setEditingProduct({});
            setProductDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="border-2 border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                <p className="text-lg font-semibold text-blue-600 mt-2">₦{product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {product.items.length} items ({product.items.filter(i => !i.isSold).length} available, {product.items.filter(i => i.isSold).length} sold)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(product);
                    setProductDialogOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setItemDialogOpen(true);
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {product.items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Digital Items
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {product.items.map((item) => (
                    <div
                      key={item._id}
                      className={`p-3 rounded-lg text-xs space-y-1 ${
                        item.isSold
                          ? "bg-gray-100 dark:bg-gray-800 opacity-60"
                          : "bg-blue-50 dark:bg-blue-950/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 font-mono space-y-1">
                          <div><span className="font-semibold">Username:</span> {item.username}</div>
                          <div><span className="font-semibold">Password:</span> {item.password}</div>
                          {item.twoFactorAuth && <div><span className="font-semibold">2FA:</span> {item.twoFactorAuth}</div>}
                          <div><span className="font-semibold">Email:</span> {item.emailAddress}</div>
                          {item.recoveryPassword && <div><span className="font-semibold">Recovery:</span> {item.recoveryPassword}</div>}
                          {item.isSold && <div className="text-red-600 dark:text-red-400 font-semibold">✓ SOLD {item.soldAt ? new Date(item.soldAt).toLocaleDateString() : ''}</div>}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSold(product._id, item._id, item.isSold)}
                            className={item.isSold ? "text-green-600" : "text-orange-600"}
                          >
                            {item.isSold ? "Unsell" : "Mark Sold"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(product._id, item._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct._id ? "Edit Product" : "Create Product"}</DialogTitle>
            <DialogDescription>Enter product details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={editingProduct.name || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                placeholder="e.g. Netflix Premium Account"
              />
            </div>
            <div>
              <Label>Price (₦) *</Label>
              <Input
                type="number"
                value={editingProduct.price || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editingProduct.description || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={editingProduct.category || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                placeholder="e.g. Streaming Services"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={editingProduct.imageUrl || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProduct}>
              {editingProduct._id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Digital Item</DialogTitle>
            <DialogDescription>
              Add account credentials for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username *</Label>
              <Input
                value={newItem.username}
                onChange={(e) => setNewItem({ ...newItem, username: e.target.value })}
                placeholder="Account username"
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                value={newItem.password}
                onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                placeholder="Account password"
              />
            </div>
            <div>
              <Label>2FA / Backup Code</Label>
              <Input
                value={newItem.twoFactorAuth}
                onChange={(e) => setNewItem({ ...newItem, twoFactorAuth: e.target.value })}
                placeholder="Optional 2FA code"
              />
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input
                value={newItem.emailAddress}
                onChange={(e) => setNewItem({ ...newItem, emailAddress: e.target.value })}
                placeholder="account@email.com"
              />
            </div>
            <div>
              <Label>Recovery Password</Label>
              <Input
                value={newItem.recoveryPassword}
                onChange={(e) => setNewItem({ ...newItem, recoveryPassword: e.target.value })}
                placeholder="Email recovery password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
