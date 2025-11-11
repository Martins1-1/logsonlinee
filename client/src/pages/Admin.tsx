import { Button } from "@/components/ui/button";
import AdminLogin from "@/components/admin/AdminLogin";
import UsersTable from "../components/admin/UsersTable";
import PaymentsTable from "../components/admin/PaymentsTable";
import CartsTable from "../components/admin/CartsTable";
import { useEffect, useState } from "react";
import AdminCatalog from "@/components/admin/AdminCatalog";
import { ThemeToggle } from "@/components/ThemeToggle";

const Admin = () => {
  // Read token on mount to avoid SSR/window issues
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<"users" | "payments" | "carts" | "catalog">("users");

  useEffect(() => {
    // initialize token from localStorage once on mount
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("admin_token");
      if (t) setToken(t);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem("admin_token", token);
    else localStorage.removeItem("admin_token");
  }, [token]);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="flex items-center justify-between mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border-2 border-white/60 dark:border-gray-800">
        <h1 
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
          style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
        >
          Admin Dashboard
        </h1>
        {token && (
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              <Button 
                variant={view === "users" ? "default" : "ghost"} 
                onClick={() => setView("users")}
                className={view === "users" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "dark:text-gray-300 dark:hover:bg-gray-800"}
              >
                Users
              </Button>
              <Button 
                variant={view === "payments" ? "default" : "ghost"} 
                onClick={() => setView("payments")}
                className={view === "payments" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "dark:text-gray-300 dark:hover:bg-gray-800"}
              >
                Payments
              </Button>
              <Button 
                variant={view === "carts" ? "default" : "ghost"} 
                onClick={() => setView("carts")}
                className={view === "carts" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "dark:text-gray-300 dark:hover:bg-gray-800"}
              >
                Carts
              </Button>
              <Button 
                variant={view === "catalog" ? "default" : "ghost"} 
                onClick={() => setView("catalog")}
                className={view === "catalog" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "dark:text-gray-300 dark:hover:bg-gray-800"}
              >
                Catalog
              </Button>
            </nav>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={() => setToken(null)} 
              aria-label="Logout"
              className="hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-300"
            >
              Logout
            </Button>
          </div>
        )}
      </header>

      {!token ? (
        <AdminLogin onLogin={(t) => setToken(t)} />
      ) : (
        <section className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border-2 border-white/60 dark:border-gray-800">
          {view === "users" && <UsersTable token={token} />}
          {view === "payments" && <PaymentsTable token={token} />}
          {view === "carts" && <CartsTable token={token} />}
          {view === "catalog" && <AdminCatalog />}
        </section>
      )}
    </main>
  );
};

export default Admin;
