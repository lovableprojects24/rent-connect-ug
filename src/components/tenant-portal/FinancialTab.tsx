import { formatUGX } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import PesapalPayButton from '@/components/payments/PesapalPayButton';
import { downloadReceipt } from '@/lib/generate-receipt';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, Receipt, Download } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

const methodLabels: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer', pesapal: 'Pesapal',
};
const methodIcons: Record<PaymentMethod, string> = {
  mtn_momo: '🟡', airtel_money: '🔴', cash: '💵', bank_transfer: '🏦', pesapal: '🌐',
};

function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  return Math.max(1, months);
}

interface FinancialTabProps {
  tenant: any;
  activeLease: any;
  payments: any[];
}

export default function FinancialTab({ tenant, activeLease, payments }: FinancialTabProps) {
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const totalPaid = completedPayments.reduce((a, p) => a + p.amount, 0);
  const totalExpected = activeLease
    ? activeLease.rent_amount * monthsBetween(activeLease.start_date, new Date().toISOString().split('T')[0])
    : 0;
  const balance = totalExpected - totalPaid;
  const paymentPercent = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 100;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Rent"
          value={activeLease ? formatUGX(activeLease.rent_amount) : '—'}
          icon={CreditCard}
          variant="primary"
        />
        <StatCard
          title="Total Paid"
          value={formatUGX(totalPaid)}
          subtitle={`${completedPayments.length} payments`}
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          title={balance > 0 ? 'Outstanding' : 'Balance'}
          value={formatUGX(Math.abs(balance))}
          subtitle={balance > 0 ? 'Arrears' : balance < 0 ? 'Overpaid' : 'Fully paid'}
          icon={TrendingDown}
          variant={balance > 0 ? 'warning' : 'secondary'}
        />
      </div>

      {/* Pay Now */}
      {activeLease && balance > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Outstanding: {formatUGX(balance)}</p>
              <p className="text-xs text-muted-foreground">Pay securely via Pesapal (MoMo, Airtel, Visa, Bank)</p>
            </div>
            <PesapalPayButton
              amount={activeLease.rent_amount}
              paymentId={`rent-${tenant.id}-${new Date().toISOString().slice(0, 7)}`}
              description={`Rent payment for ${activeLease.properties?.name} - ${activeLease.units?.name}`}
            />
          </div>
        </motion.div>
      )}

      {/* Payment Progress */}
      {activeLease && totalExpected > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-sm">Payment Progress</h3>
            <span className="text-sm font-medium">{paymentPercent}%</span>
          </div>
          <Progress value={paymentPercent} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Paid: {formatUGX(totalPaid)}</span>
            <span>Expected: {formatUGX(totalExpected)}</span>
          </div>
        </div>
      )}

      {/* Receipt History */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" /> Receipts & Payment History
        </h3>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payments found</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{methodIcons[p.method as PaymentMethod]}</span>
                  <div>
                    <p className="text-sm font-medium">{formatUGX(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">{methodLabels[p.method as PaymentMethod]} · {p.payment_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <StatusBadge status={p.status} />
                    {p.reference && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{p.reference}</p>}
                  </div>
                  {p.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      title="Download receipt"
                      onClick={() => downloadReceipt({
                        payment: p,
                        tenantName: tenant.full_name,
                        propertyName: activeLease?.properties?.name,
                        unitName: activeLease?.units?.name,
                      })}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
