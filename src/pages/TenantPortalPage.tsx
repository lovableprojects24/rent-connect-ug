import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialTab from '@/components/tenant-portal/FinancialTab';
import MaintenanceTab from '@/components/tenant-portal/MaintenanceTab';
import LeaseTab from '@/components/tenant-portal/LeaseTab';
import { AlertCircle, Wallet, Wrench, FileText } from 'lucide-react';

export default function TenantPortalPage() {
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold">Welcome, {tenant.full_name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {activeLease
            ? `${activeLease.properties?.name} · ${activeLease.units?.name}`
            : 'No active lease'}
        </p>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm">
            <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5 text-xs sm:text-sm">
            <Wrench className="w-4 h-4" /> <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="lease" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Lease & Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <FinancialTab tenant={tenant} activeLease={activeLease} payments={payments} />
        </TabsContent>
        <TabsContent value="maintenance">
          <MaintenanceTab activeLease={activeLease} maintenanceRequests={maintenanceRequests} onRefresh={fetchAll} />
        </TabsContent>
        <TabsContent value="lease">
          <LeaseTab leases={leases} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
