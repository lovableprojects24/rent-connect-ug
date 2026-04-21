import { useState } from 'react';
import { Download, Search, CreditCard, TrendingUp, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatUGX } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import RecordPaymentDialog from '@/components/forms/RecordPaymentDialog';
import EditPaymentDialog from '@/components/forms/EditPaymentDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { usePayments, useDeletePayment } from '@/hooks/usePayments';
import type { Database } from '@/integrations/supabase/types';
import type { PaymentWithDetails } from '@/services/payments';

type PaymentMethod = Database['public']['Enums']['payment_method'];

const methodLabels: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer', pesapal: 'Pesapal',
};

export default function PaymentsPage() {
  const { data: payments = [], isLoading: loading } = usePayments();
  const deletePaymentMutation = useDeletePayment();
  const [editPayment, setEditPayment] = useState<PaymentWithDetails | null>(null);
  const [deletePayment, setDeletePayment] = useState<PaymentWithDetails | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleDelete = async () => {
    if (!deletePayment) return;
    await deletePaymentMutation.mutateAsync(deletePayment.id);
    setDeletePayment(null);
  };

  // Filter by search and status
  const filtered = (payments as PaymentWithDetails[]).filter((p) => {
    const matchesSearch =
      !search ||
      p.reference?.toLowerCase().includes(search.toLowerCase()) ||
      p.property_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      formatUGX(p.amount).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);
  const totalOutstanding = payments.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
  const totalFailed = payments.filter(p => p.status === 'failed').reduce((a, p) => a + p.amount, 0);
  const collectionRate = payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-1">My Payments</h1>
          <p className="text-muted-foreground text-sm">Payments across your properties — automatically totalled</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RecordPaymentDialog onSuccess={() => {}} />
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={TrendingUp} label="Collected" value={formatUGX(totalCollected)} color="text-green-600" bgColor="bg-green-500/10" />
        <SummaryCard icon={Clock} label="Outstanding" value={formatUGX(totalOutstanding)} color="text-yellow-600" bgColor="bg-yellow-500/10" />
        <SummaryCard icon={AlertTriangle} label="Failed" value={formatUGX(totalFailed)} color="text-destructive" bgColor="bg-destructive/10" />
        <SummaryCard icon={BarChart3} label="Collection Rate" value={`${collectionRate}%`} color="text-primary" bgColor="bg-primary/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by tenant, property, reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">
            {payments.length === 0 ? 'No Payments Yet' : 'No matching payments'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {payments.length === 0
              ? 'Record your first payment to get started'
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{payment.tenant_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{payment.property_name || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatUGX(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{payment.payment_date}</td>
                    <td className="px-4 py-3 text-sm">{methodLabels[payment.method]}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3">
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

function SummaryCard({ icon: Icon, label, value, color, bgColor }: { icon: React.ElementType; label: string; value: string; color: string; bgColor: string }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border flex items-start gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        <p className={`text-xl font-heading font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
