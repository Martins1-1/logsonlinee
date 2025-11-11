import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type User = {
  _id: string;
  email: string;
  name?: string;
  payments?: any[];
  createdAt?: string;
};   

export default function UsersTable({ token }: { token: string }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
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
          setUsers(data);
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

  if (loading) return <div className="p-4 text-center text-gray-600">Loading users...</div>;
  if (error) return <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>;
  if (!users || users.length === 0) return <div className="p-4 text-center text-gray-600">No users found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
        Users ({users.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-800">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <tr className="text-left">
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">ID</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Email</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Name</th>
              <th className="p-4 text-gray-700 dark:text-gray-300 font-semibold">Payments</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="p-4 text-gray-800 dark:text-gray-200 font-mono text-sm">{u._id}</td>
                <td className="p-4 text-gray-800 dark:text-gray-200">{u.email}</td>
                <td className="p-4 text-gray-800 dark:text-gray-200">{u.name || "—"}</td>
                <td className="p-4 text-gray-800 dark:text-gray-200">{(u.payments || []).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
