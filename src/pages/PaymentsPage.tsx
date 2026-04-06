import { useEffect, useState } from 'react';
import { Download, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatUGX } from '@/data/mock-data';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import RecordPaymentDialog from '@/components/forms/RecordPaymentDialog';
import type { Tables, Database } from '@/integrations/supabase/types';

type Payment = Tables<'payments'>;
type PaymentMethod = Database['public']['Enums']['payment_method'];

const methodLabels: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN MoMo',
  airtel_money: 'Airtel Money',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
};

const methodIcons: Record<PaymentMethod, string> = {
  mtn_momo: '🟡',
  airtel_money: '🔴',
  cash: '💵',
  bank_transfer: '🏦',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
    if (data) setPayments(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Total collected: {formatUGX(totalCollected)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <RecordPaymentDialog onSuccess={fetchPayments} />
        </div>
      </div>

      {/* Mobile Money Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'hsl(48 96% 90%)' }}>🟡</div>
          <div>
            <p className="text-sm font-semibold">MTN MoMo</p>
            <p className="text-xs text-muted-foreground">Record payment</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'hsl(0 72% 92%)' }}>🔴</div>
          <div>
            <p className="text-sm font-semibold">Airtel Money</p>
            <p className="text-xs text-muted-foreground">Record payment</p>
          </div>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No payments yet</p>
          <p className="text-sm mt-1">Record your first payment</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {payments.map((payment, i) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{methodIcons[payment.method]}</span>
                    <div>
                      <p className="text-sm font-medium">{methodLabels[payment.method]}</p>
                      <p className="text-xs text-muted-foreground">{payment.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-muted-foreground">{payment.payment_date}</span>
                  <span className="font-semibold">{formatUGX(payment.amount)}</span>
                </div>
                {payment.reference && <p className="text-xs text-muted-foreground mt-1">Ref: {payment.reference}</p>}
              </motion.div>
            ))}
          </div>

          {/* Desktop table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Reference</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold">{formatUGX(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-1.5">{methodIcons[payment.method]} {methodLabels[payment.method]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{payment.type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{payment.payment_date}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{payment.reference || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  );
}



