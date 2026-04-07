import { useState } from 'react';
import { Plus, Download, Search, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { formatUGX } from '@/data/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import RecordPaymentDialog from '@/components/forms/RecordPaymentDialog';
import EditPaymentDialog from '@/components/forms/EditPaymentDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { usePayments, useDeletePayment } from '@/hooks/usePayments';
import type { Tables, Database } from '@/integrations/supabase/types';

type Payment = Tables<'payments'>;
type PaymentMethod = Database['public']['Enums']['payment_method'];

const methodLabels: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer', pesapal: 'Pesapal',
};

export default function PaymentsPage() {
  const { data: payments = [], isLoading: loading } = usePayments();
  const deletePaymentMutation = useDeletePayment();
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [deletePayment, setDeletePayment] = useState<Payment | null>(null);
  const [search, setSearch] = useState('');

  const handleDelete = async () => {
    if (!deletePayment) return;
    await deletePaymentMutation.mutateAsync(deletePayment.id);
    setDeletePayment(null);
  };

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
  const totalFailed = payments.filter(p => p.status === 'failed').reduce((a, p) => a + p.amount, 0);
  const collectionRate = payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Payments</h1>
          <p className="text-muted-foreground">Track and manage all rent payments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RecordPaymentDialog onSuccess={() => {}} />
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Total Collected</p>
          <p className="text-2xl font-heading font-semibold text-green-600">{formatUGX(totalCollected)}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Pending</p>
          <p className="text-2xl font-heading font-semibold text-yellow-600">{formatUGX(totalPending)}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Failed</p>
          <p className="text-2xl font-heading font-semibold text-red-600">{formatUGX(totalFailed)}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Collection Rate</p>
          <p className="text-2xl font-heading font-semibold text-blue-600">{collectionRate}%</p>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Payments Yet</h3>
          <p className="text-muted-foreground">Record your first payment to get started</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Reference</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold">{formatUGX(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.payment_date}</td>
                    <td className="px-6 py-4 text-sm">{methodLabels[payment.method]}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{payment.reference || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditPayment(payment)} className="text-primary hover:underline text-sm">Edit</button>
                        <button onClick={() => setDeletePayment(payment)} className="text-destructive hover:underline text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditPaymentDialog payment={editPayment} open={!!editPayment} onOpenChange={(o) => !o && setEditPayment(null)} onSuccess={() => {}} />
      <DeleteConfirmDialog open={!!deletePayment} onOpenChange={(o) => !o && setDeletePayment(null)} onConfirm={handleDelete} loading={deletePaymentMutation.isPending} title="Delete Payment" description={`Are you sure you want to delete this ${formatUGX(deletePayment?.amount || 0)} payment?`} />
    </div>
  );
}
