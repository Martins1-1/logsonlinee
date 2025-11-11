import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type Cart = {
  _id: string;
  user?: { email?: string };
  items?: Array<{ productName?: string; quantity?: number; price?: number }>;
  createdAt?: string;
};

export default function CartsTable({ token }: { token: string }) {
  const [carts, setCarts] = useState<Cart[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/carts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || `HTTP ${r.status}: ${r.statusText}`);
        }
        return data;
      })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setCarts(data);
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

  if (loading) return <div className="p-4 text-center text-gray-600">Loading carts...</div>;
  if (error) return <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
  if (!carts || carts.length === 0) return <div className="p-4 text-center text-gray-600">No carts found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
        Carts ({carts.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-800">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <tr className="text-left">
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">ID</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">User</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Items</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Total</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {carts.map((c) => {
              const total = (c.items || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
              return (
                <tr key={c._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 text-gray-800 dark:text-gray-200 font-mono text-sm">{c._id}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-200">{c.user?.email || "—"}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-200">{(c.items || []).length}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-200 font-semibold">${total.toFixed(2)}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-200 text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
