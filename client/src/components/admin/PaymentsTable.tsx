import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Payment = {
  _id: string;
  amount: number;
  method: string;
  status: string;
  reference?: string;
  createdAt?: string;
  user?: { email?: string };
};

export default function PaymentsTable({ token }: { token: string }) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);
    apiFetch("/payments", { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setPayments(data);
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

  if (loading) return <div className="p-4 text-center text-gray-600">Loading payments...</div>;
  if (error) return <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
  if (!payments || payments.length === 0) return <div className="p-4 text-center text-gray-600">No payments found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
        Payments ({payments.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-800">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <tr className="text-left">
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Reference</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">User</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Amount</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Method</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Status</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="p-4 text-gray-800 dark:text-gray-200 font-mono text-sm">{p.reference}</td>
                <td className="p-4 text-gray-800 dark:text-gray-200">{p.user?.email || "—"}</td>
                <td className="p-4 text-gray-800 dark:text-gray-200 font-semibold">${p.amount}</td>
                <td className="p-4 text-gray-800 dark:text-gray-200">{p.method}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 
                    p.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' : 
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-gray-800 dark:text-gray-200 text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
