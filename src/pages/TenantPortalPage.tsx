import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialTab from '@/components/tenant-portal/FinancialTab';
import MaintenanceTab from '@/components/tenant-portal/MaintenanceTab';
import LeaseTab from '@/components/tenant-portal/LeaseTab';
import { formatUGX } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertCircle, Wallet, Wrench, FileText, CheckCircle, Clock, CreditCard,
  Building2, Calendar, Phone, Mail,
} from 'lucide-react';

export default function TenantPortalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [leases, setLeases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (!tenantData) { setLoading(false); return; }
    setTenant(tenantData);

    const [leasesRes, paymentsRes, maintenanceRes] = await Promise.all([
      supabase.from('leases').select('*, properties(name), units(name)').eq('tenant_id', tenantData.id).order('start_date', { ascending: false }),
      supabase.from('payments').select('*').eq('tenant_id', tenantData.id).order('payment_date', { ascending: false }),
      supabase.from('maintenance_requests').select('*, properties(name), units(name)').eq('submitted_by', user!.id).order('created_at', { ascending: false }),
    ]);

    if (leasesRes.data) setLeases(leasesRes.data);
    if (paymentsRes.data) setPayments(paymentsRes.data);
    if (maintenanceRes.data) setMaintenanceRequests(maintenanceRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No tenant profile linked to your account</p>
        <p className="text-sm mt-1">Contact your landlord or property manager to link your account.</p>
      </div>
    );
  }

  const activeLease = leases.find((l) => l.status === 'active');
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const totalPaid = completedPayments.reduce((a, p) => a + p.amount, 0);
  const openMaintenance = maintenanceRequests.filter((m) => m.status === 'open' || m.status === 'in_progress').length;

  // Rent status
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const paidThisMonth = completedPayments.some(
    (p) => p.payment_date?.startsWith(currentMonth)
  );
  const rentStatus = paidThisMonth ? 'paid' : 'due';
  const daysUntilDue = activeLease ? Math.max(0, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">{tenant.full_name}</h1>
              {activeLease ? (
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>{activeLease.properties?.name} · {activeLease.units?.name}</span>
                </div>
              ) : (
                <p className="text-blue-200 text-sm">No active lease</p>
              )}
            </div>
            {activeLease && (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  {rentStatus === 'paid' ? (
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-300" />
                  )}
                  <span className="text-sm font-medium">
                    {rentStatus === 'paid' ? 'Rent Paid' : 'Rent Due'}
                  </span>
                </div>
                <p className="text-2xl font-heading font-bold">{formatUGX(activeLease.rent_amount)}</p>
                <p className="text-xs text-blue-200 mt-1">
                  {rentStatus === 'paid' ? 'This month is settled ✓' : `${daysUntilDue} days remaining`}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-4 text-center"
        >
          <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-lg font-heading font-semibold">{formatUGX(activeLease?.rent_amount || 0)}</p>
          <p className="text-xs text-muted-foreground">Monthly Rent</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-4 text-center"
        >
          <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-lg font-heading font-semibold">{formatUGX(totalPaid)}</p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-4 text-center"
        >
          <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-lg font-heading font-semibold">{leases.length}</p>
          <p className="text-xs text-muted-foreground">Lease Records</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border border-border p-4 text-center"
        >
          <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Wrench className="w-5 h-5" />
          </div>
          <p className="text-lg font-heading font-semibold">{openMaintenance}</p>
          <p className="text-xs text-muted-foreground">Open Requests</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Building2 className="w-4 h-4" /> <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Wrench className="w-4 h-4" /> <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="lease" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Lease</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-5 mt-5">
          {/* Lease Details */}
          {activeLease && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Current Lease
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Property</p>
                  <p className="font-medium">{activeLease.properties?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Unit</p>
                  <p className="font-medium">{activeLease.units?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Period</p>
                  <p className="font-medium">{activeLease.start_date} → {activeLease.end_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Deposit</p>
                  <p className="font-medium">{formatUGX(activeLease.deposit)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact & Recent Payments side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-heading font-semibold mb-4">Your Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{tenant.phone}</p>
                  </div>
                </div>
                {tenant.email && (
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{tenant.email}</p>
                    </div>
                  </div>
                )}
                {tenant.emergency_contact && (
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Emergency Contact</p>
                      <p className="text-sm font-medium">{tenant.emergency_contact}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Payments */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-heading font-semibold mb-4">Recent Payments</h3>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No payments yet</p>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{formatUGX(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">{p.payment_date}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                        p.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Maintenance */}
          {maintenanceRequests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" /> Recent Maintenance Requests
              </h3>
              <div className="space-y-3">
                {maintenanceRequests.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        m.status === 'open' ? 'bg-orange-500' :
                        m.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{m.issue}</p>
                        <p className="text-xs text-muted-foreground">{m.properties?.name} · {new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      m.priority === 'urgent' || m.priority === 'high' ? 'bg-red-100 text-red-700' :
                      m.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {m.priority}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="financial" className="mt-5">
          <FinancialTab tenant={tenant} activeLease={activeLease} payments={payments} />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-5">
          <MaintenanceTab activeLease={activeLease} maintenanceRequests={maintenanceRequests} onRefresh={fetchAll} />
        </TabsContent>
        <TabsContent value="lease" className="mt-5">
          <LeaseTab leases={leases} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
