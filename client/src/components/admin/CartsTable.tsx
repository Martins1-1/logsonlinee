import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type PurchaseHistory = {
  _id: string;
  userId?: string;
  user?: { email?: string };
  productId?: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  quantity?: number;
  assignedSerials?: string[];
  purchaseDate?: string;
};

export default function CartsTable({ token }: { token: string }) {
  const [purchases, setPurchases] = useState<PurchaseHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);
    apiFetch("/api/purchase-history", { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setPurchases(data);
        } else {
          setError("Invalid response format");
        }
      })
      .catch((e) => {
        if (mounted) setError(String(e));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) return <div className="p-4 text-center text-gray-600 dark:text-gray-400">Loading purchase history...</div>;
  if (error) return <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900">Error: {error}</div>;
  if (!purchases || purchases.length === 0) return <div className="p-4 text-center text-gray-600 dark:text-gray-400">No purchase history found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
        Buy History ({purchases.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-800">
        <table className="w-full table-auto border-collapse min-w-[700px]">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <tr className="text-left">
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">User</th>
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Product</th>
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Category</th>
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Qty</th>
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Price</th>
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Total</th>
              <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => {
              const total = (p.price || 0) * (p.quantity || 0);
              return (
                <tr key={p._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">{p.user?.email || "—"}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">{p.name || "—"}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">{p.category || "—"}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">{p.quantity || 0}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">₦{(p.price || 0).toFixed(2)}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200 font-semibold">₦{total.toFixed(2)}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 dark:text-gray-200">{p.purchaseDate ? new Date(p.purchaseDate).toLocaleString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
