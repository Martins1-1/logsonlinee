import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Payment = {
  _id: string;
  amount: number;
  method: string;
  status: string;
  reference?: string;
  createdAt?: string;
  user?: { email?: string };
  email?: string; // For localStorage users
  userLocalId?: string; // For localStorage users
};

type PaymentMethodSettings = {
  instantErcasEnabled: boolean;
  quickPayEnabled: boolean;
  manualDepositEnabled: boolean;
};

export default function PaymentsTable({ token }: { token: string }) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [methodSettings, setMethodSettings] = useState<PaymentMethodSettings | null>(null);
  const [methodSettingsLoading, setMethodSettingsLoading] = useState(false);
  const [methodSettingsError, setMethodSettingsError] = useState<string | null>(null);
  const [methodSettingsSaving, setMethodSettingsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [searchEmail, setSearchEmail] = useState("");

  const fetchPayments = () => {
    setLoading(true);
    setError(null);
  apiFetch("/api/payments", { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => {
        if (Array.isArray(data)) {
          setPayments(data);
        } else {
          setError("Invalid response format");
        }
      })
      .catch((e) => {
        setError(String(e));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchMethodSettings = () => {
    setMethodSettingsLoading(true);
    setMethodSettingsError(null);
    apiFetch("/api/payment-methods")
      .then((data) => {
        setMethodSettings({
          instantErcasEnabled: Boolean(data?.instantErcasEnabled),
          quickPayEnabled: Boolean(data?.quickPayEnabled),
          manualDepositEnabled: Boolean(data?.manualDepositEnabled),
        });
      })
      .catch((e) => {
        setMethodSettingsError(String(e));
        setMethodSettings(null);
      })
      .finally(() => setMethodSettingsLoading(false));
  };

  const updateMethodSetting = async (key: keyof PaymentMethodSettings, value: boolean) => {
    setMethodSettingsSaving(true);
    try {
      const next = await apiFetch("/api/payment-methods", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
      setMethodSettings({
        instantErcasEnabled: Boolean(next?.instantErcasEnabled),
        quickPayEnabled: Boolean(next?.quickPayEnabled),
        manualDepositEnabled: Boolean(next?.manualDepositEnabled),
      });
      toast({
        title: "Updated",
        description: "Payment method setting saved.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: String(e),
        variant: "destructive",
      });
      fetchMethodSettings();
    } finally {
      setMethodSettingsSaving(false);
    }
  };

  useEffect(() => {
    fetchMethodSettings();
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      await apiFetch(`/api/payments/${paymentToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Payment deleted",
        description: `Payment ${paymentToDelete.reference || paymentToDelete._id} has been deleted.`,
      });

      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      fetchPayments();
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  };

  const safePayments = payments ?? [];
  const filteredPayments = searchEmail
    ? safePayments.filter((p) => {
        const userEmail = p.user?.email || p.email || "";
        return userEmail.toLowerCase().includes(searchEmail.toLowerCase());
      })
    : safePayments;

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500">
        Payments ({filteredPayments.length}{searchEmail ? ` of ${safePayments.length}` : ''})
      </h2>

      {/* Payment method toggles */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-900 dark:text-gray-100">Payment Methods</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMethodSettings}
            className="text-gray-500 hover:text-gray-700"
            disabled={methodSettingsLoading || methodSettingsSaving}
          >
            Refresh
          </Button>
        </div>

        {methodSettingsError ? (
          <div className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300 rounded-md border border-red-200 dark:border-red-900/40 p-3">
            Failed to load payment method settings.
          </div>
        ) : methodSettingsLoading && !methodSettings ? (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">Loading...</div>
        ) : methodSettings ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Instant payment (ercas)</div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {methodSettings.instantErcasEnabled ? "ON" : "OFF"}
                </span>
                <Switch
                  checked={methodSettings.instantErcasEnabled}
                  onCheckedChange={(checked) => updateMethodSetting("instantErcasEnabled", checked)}
                  disabled={methodSettingsSaving}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Pay</div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {methodSettings.quickPayEnabled ? "ON" : "OFF"}
                </span>
                <Switch
                  checked={methodSettings.quickPayEnabled}
                  onCheckedChange={(checked) => updateMethodSetting("quickPayEnabled", checked)}
                  disabled={methodSettingsSaving}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Manual Deposit</div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {methodSettings.manualDepositEnabled ? "ON" : "OFF"}
                </span>
                <Switch
                  checked={methodSettings.manualDepositEnabled}
                  onCheckedChange={(checked) => updateMethodSetting("manualDepositEnabled", checked)}
                  disabled={methodSettingsSaving}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">No data.</div>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-800">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by user email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {searchEmail && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchEmail("")}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-600">Loading payments...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-8 text-center text-gray-600 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800">
          No payments found{searchEmail ? ` for "${searchEmail}"` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-800">
          <table className="w-full table-auto border-collapse min-w-[700px]">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <tr className="text-left">
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Reference</th>
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">User</th>
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Amount</th>
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Method</th>
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Date</th>
                <th className="p-3 md:p-4 text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => {
              // Get user email from either populated user object or direct email field
              const userEmail = p.user?.email || p.email || "—";
              // Normalize status to lowercase for comparison
              const statusLower = p.status.toLowerCase();
              const statusDisplay = statusLower === 'completed' ? 'Complete' : 
                                   statusLower === 'pending' ? 'Pending' : 
                                   p.status;
              
              return (
                <tr key={p._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 dark:text-gray-200 font-mono break-all">{p.reference}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200">{userEmail}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200 font-semibold">₦{p.amount.toFixed(2)}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base text-gray-800 dark:text-gray-200 capitalize">{p.method}</td>
                  <td className="p-3 md:p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      statusLower === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 
                      statusLower === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' : 
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {statusDisplay}
                    </span>
                  </td>
                  <td className="p-3 md:p-4 text-xs md:text-sm text-gray-800 dark:text-gray-200">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</td>
                  <td className="p-3 md:p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(p)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete Payment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record?
              {paymentToDelete && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  <div><strong>Reference:</strong> {paymentToDelete.reference || paymentToDelete._id}</div>
                  <div><strong>Amount:</strong> ₦{paymentToDelete.amount.toFixed(2)}</div>
                  <div><strong>User:</strong> {paymentToDelete.user?.email || paymentToDelete.email || "—"}</div>
                </div>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
