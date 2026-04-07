import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { onboardingService, OnboardingProgress } from '@/services/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, UserPlus, Building2, Users, FileText, CreditCard,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, Rocket,
} from 'lucide-react';
import { formatUGX } from '@/lib/utils';

const STEPS = [
  { title: 'System Setup', icon: Settings, desc: 'Configure your property management system' },
  { title: 'Create Manager', icon: UserPlus, desc: 'Add managers to handle properties' },
  { title: 'Property & Units', icon: Building2, desc: 'Set up properties and rooms' },
  { title: 'Register Tenants', icon: Users, desc: 'Add tenants and assign units' },
  { title: 'Create Lease', icon: FileText, desc: 'Set up lease agreements' },
  { title: 'Payment Config', icon: CreditCard, desc: 'Configure payment methods' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    let p = await onboardingService.get(user.id);
    if (!p) p = await onboardingService.create(user.id);
    setProgress(p);
    setActiveStep(Math.min(p.current_step - 1, 5));
    setLoading(false);
    if (onboardingService.isComplete(p)) navigate('/', { replace: true });
  };

  const handleStepComplete = useCallback(async (stepIndex: number, extra: Record<string, any> = {}) => {
    if (!user) return;
    try {
      const updated = await onboardingService.completeStep(user.id, stepIndex, extra);
      setProgress(updated);
      if (onboardingService.isComplete(updated)) {
        toast.success('🎉 Onboarding complete! Welcome to RentFlow.');
        navigate('/', { replace: true });
      } else {
        setActiveStep(Math.min(stepIndex + 1, 5));
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [user, navigate]);

  const isStepDone = (i: number) => {
    if (!progress) return false;
    const keys = ['system_setup', 'manager_creation', 'property_setup', 'tenant_registration', 'lease_creation', 'payment_config'] as const;
    return progress.steps_completed[keys[i]];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading onboarding…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Welcome to RentFlow 🏠</h1>
          <p className="text-muted-foreground mt-2">Let's set up your property management system step by step</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, i) => {
            const done = isStepDone(i);
            const active = i === activeStep;
            const Icon = step.icon;
            return (
              <button
                key={i}
                onClick={() => (done || i <= activeStep) && setActiveStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${active ? 'bg-primary text-primary-foreground shadow-md' : ''}
                  ${done && !active ? 'bg-primary/10 text-primary' : ''}
                  ${!done && !active ? 'text-muted-foreground hover:text-foreground' : ''}
                `}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                <span className="hidden md:inline">{step.title}</span>
                {i < 5 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeStep === 0 && <SystemSetupStep onComplete={(extra) => handleStepComplete(0, extra)} done={isStepDone(0)} progress={progress} />}
            {activeStep === 1 && <ManagerStep onComplete={() => handleStepComplete(1)} done={isStepDone(1)} />}
            {activeStep === 2 && <PropertyStep onComplete={() => handleStepComplete(2)} done={isStepDone(2)} />}
            {activeStep === 3 && <TenantStep onComplete={() => handleStepComplete(3)} done={isStepDone(3)} />}
            {activeStep === 4 && <LeaseStep onComplete={() => handleStepComplete(4)} done={isStepDone(4)} />}
            {activeStep === 5 && <PaymentConfigStep onComplete={(extra) => handleStepComplete(5, extra)} done={isStepDone(5)} progress={progress} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {isStepDone(activeStep) && activeStep < 5 && (
            <Button onClick={() => setActiveStep(activeStep + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: System Setup ─── */
function SystemSetupStep({ onComplete, done, progress }: { onComplete: (extra: any) => void; done: boolean; progress: OnboardingProgress | null }) {
  const [systemName, setSystemName] = useState(progress?.system_name || '');
  const [contact, setContact] = useState(progress?.system_contact || '');
  const [dueDay, setDueDay] = useState(String(progress?.default_rent_due_day || 1));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!systemName.trim()) { toast.error('System name is required'); return; }
    setSaving(true);
    try {
      await onComplete({
        system_name: systemName.trim(),
        system_contact: contact.trim(),
        default_rent_due_day: parseInt(dueDay) || 1,
      });
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> System Setup</CardTitle>
        <CardDescription>Configure your property management business details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done && <DoneBanner />}
        <div className="space-y-2">
          <Label>Business / System Name *</Label>
          <Input placeholder="e.g. Kampala Properties Ltd" value={systemName} onChange={e => setSystemName(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label>Contact Phone / Email</Label>
          <Input placeholder="+256 700 000 000" value={contact} onChange={e => setContact(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label>Default Rent Due Day</Label>
          <Select value={dueDay} onValueChange={setDueDay}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 15, 20, 25, 28].map(d => (
                <SelectItem key={d} value={String(d)}>{d}{d === 1 ? 'st' : d === 5 ? 'th' : 'th'} of each month</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? 'Saving…' : done ? 'Update & Continue' : 'Save & Continue'} <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Step 2: Manager Creation ─── */
function ManagerStep({ onComplete, done }: { onComplete: () => void; done: boolean }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => { loadManagers(); }, []);

  const loadManagers = async () => {
    const { data } = await supabase.from('user_roles').select('user_id, role').eq('role', 'manager' as any);
    if (data) {
      const userIds = data.map(r => r.user_id);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', userIds);
        setManagers(profiles || []);
      }
    }
  };

  const handleCreate = async () => {
    if (!email.trim()) { toast.error('Manager email is required'); return; }
    if (!fullName.trim()) { toast.error('Manager name is required'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-tenant', {
        body: { full_name: fullName.trim(), email: email.trim(), phone: phone.trim() || '0000000000', is_manager: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Manager account created! Temp password: ${data.temporary_password}`);
      setEmail('');
      setFullName('');
      setPhone('');
      loadManagers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create manager');
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Create Manager</CardTitle>
        <CardDescription>Add property managers who will handle day-to-day operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done && <DoneBanner />}
        {managers.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Existing Managers ({managers.length})</p>
            {managers.map(m => (
              <p key={m.user_id} className="text-sm text-muted-foreground">• {m.full_name || 'Unnamed'} — {m.phone || 'No phone'}</p>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" placeholder="manager@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input placeholder="+256 700 000 000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreate} disabled={saving} className="gap-2">
            {saving ? 'Creating…' : 'Create Manager'} <UserPlus className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onComplete} className="gap-2">
            {managers.length > 0 || done ? 'Continue' : 'Skip for now'} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 3: Property & Units ─── */
function PropertyStep({ onComplete, done }: { onComplete: () => void; done: boolean }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Apartments');
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  // Unit form
  const [selectedPropId, setSelectedPropId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitRent, setUnitRent] = useState('');
  const [unitType, setUnitType] = useState<string>('apartment');
  const [addingUnit, setAddingUnit] = useState(false);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    const { data } = await supabase.from('properties').select('*, units(id, name, rent_amount, status, type)').order('created_at', { ascending: false });
    setProperties(data || []);
    if (data?.length && !selectedPropId) setSelectedPropId(data[0].id);
  };

  const handleAddProperty = async () => {
    if (!name.trim() || !location.trim()) { toast.error('Name and location are required'); return; }
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('properties').insert({ name: name.trim(), location: location.trim(), type, owner_id: user.id });
      if (error) throw error;
      toast.success('Property added!');
      setName(''); setLocation('');
      loadProperties();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const handleAddUnit = async () => {
    if (!selectedPropId || !unitName.trim()) { toast.error('Select a property and enter unit name'); return; }
    const rent = parseInt(unitRent || '0', 10);
    setAddingUnit(true);
    try {
      const { error } = await supabase.from('units').insert({
        property_id: selectedPropId, name: unitName.trim(), rent_amount: rent, type: unitType as any,
      });
      if (error) throw error;
      toast.success('Unit added!');
      setUnitName(''); setUnitRent('');
      loadProperties();
    } catch (e: any) { toast.error(e.message); } finally { setAddingUnit(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Property & Unit Setup</CardTitle>
        <CardDescription>Add your buildings and their rooms/units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {done && <DoneBanner />}
        {/* Add Property */}
        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="font-medium text-sm">Add Property</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Property name" value={name} onChange={e => setName(e.target.value)} maxLength={100} />
            <Input placeholder="Location (e.g. Ntinda, Kampala)" value={location} onChange={e => setLocation(e.target.value)} maxLength={200} />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Apartments', 'Hostel', 'Rentals', 'Commercial'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddProperty} disabled={saving} size="sm">{saving ? 'Adding…' : 'Add Property'}</Button>
        </div>

        {/* Add Unit */}
        {properties.length > 0 && (
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium text-sm">Add Unit / Room</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={selectedPropId} onValueChange={setSelectedPropId}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Unit name (e.g. Room 1A)" value={unitName} onChange={e => setUnitName(e.target.value)} maxLength={50} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="number" placeholder="Rent (UGX)" value={unitRent} onChange={e => setUnitRent(e.target.value)} min={0} />
              <Select value={unitType} onValueChange={setUnitType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="bed">Bed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddUnit} disabled={addingUnit} size="sm">{addingUnit ? 'Adding…' : 'Add Unit'}</Button>
          </div>
        )}

        {/* Current Properties */}
        {properties.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Your Properties</h4>
            {properties.map(p => (
              <div key={p.id} className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-sm">{p.name} <span className="text-muted-foreground">— {p.location}</span></p>
                {p.units?.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {p.units.map((u: any) => (
                      <span key={u.id} className="text-xs bg-background px-2 py-1 rounded border">
                        {u.name} — {formatUGX(u.rent_amount)} ({u.status})
                      </span>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground mt-1">No units yet</p>}
              </div>
            ))}
          </div>
        )}

        <Button onClick={onComplete} className="gap-2">
          {properties.length > 0 ? 'Continue' : 'Skip for now'} <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Step 4: Tenant Registration ─── */
function TenantStep({ onComplete, done }: { onComplete: () => void; done: boolean }) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false }).limit(20);
    setTenants(data || []);
  };

  const handleCreate = async () => {
    if (!fullName.trim() || !phone.trim()) { toast.error('Name and phone are required'); return; }
    if (!email.trim()) { toast.error('Email is required for tenant login'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-tenant', {
        body: { full_name: fullName.trim(), email: email.trim(), phone: phone.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Tenant created! Temp password: ${data.temporary_password}`);
      setFullName(''); setPhone(''); setEmail('');
      loadTenants();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Register Tenants</CardTitle>
        <CardDescription>Add tenants who will occupy your properties</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done && <DoneBanner />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input placeholder="Sarah Namukasa" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input placeholder="+256 770 123 456" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" placeholder="tenant@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        {tenants.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Registered Tenants ({tenants.length})</p>
            {tenants.slice(0, 5).map(t => (
              <p key={t.id} className="text-sm text-muted-foreground">• {t.full_name} — {t.phone}</p>
            ))}
            {tenants.length > 5 && <p className="text-xs text-muted-foreground">...and {tenants.length - 5} more</p>}
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Tenant'}</Button>
          <Button variant="outline" onClick={onComplete} className="gap-2">
            {tenants.length > 0 || done ? 'Continue' : 'Skip for now'} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 5: Lease Creation ─── */
function LeaseStep({ onComplete, done }: { onComplete: () => void; done: boolean }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);

  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [deposit, setDeposit] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!propertyId) { setUnits([]); return; }
    supabase.from('units').select('*').eq('property_id', propertyId).eq('status', 'vacant').order('name')
      .then(({ data }) => { setUnits(data || []); setUnitId(''); });
  }, [propertyId]);

  useEffect(() => {
    const unit = units.find(u => u.id === unitId);
    if (unit?.rent_amount) setRentAmount(String(unit.rent_amount));
  }, [unitId, units]);

  const loadData = async () => {
    const [pRes, tRes, lRes] = await Promise.all([
      supabase.from('properties').select('*').order('name'),
      supabase.from('tenants').select('*').order('full_name'),
      supabase.from('leases').select('*, tenants(full_name), properties(name), units(name)').order('created_at', { ascending: false }).limit(10),
    ]);
    setProperties(pRes.data || []);
    setTenants(tRes.data || []);
    setLeases(lRes.data || []);
  };

  const handleCreate = async () => {
    if (!propertyId || !unitId || !tenantId || !startDate || !endDate) { toast.error('All fields are required'); return; }
    const rent = parseInt(rentAmount, 10);
    const dep = parseInt(deposit || '0', 10);
    if (isNaN(rent) || rent < 1) { toast.error('Valid rent required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('leases').insert({
        property_id: propertyId, unit_id: unitId, tenant_id: tenantId,
        start_date: startDate, end_date: endDate, rent_amount: rent, deposit: dep, status: 'active',
      });
      if (error) throw error;
      await supabase.from('units').update({ status: 'occupied' as const }).eq('id', unitId);
      toast.success('Lease created!');
      setPropertyId(''); setUnitId(''); setTenantId(''); setStartDate(''); setEndDate(''); setRentAmount(''); setDeposit('');
      loadData();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Create Lease</CardTitle>
        <CardDescription>Link tenants to units with lease agreements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done && <DoneBanner />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Property *</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unit *</Label>
            <Select value={unitId} onValueChange={setUnitId} disabled={!propertyId}>
              <SelectTrigger><SelectValue placeholder={propertyId ? (units.length ? 'Select unit' : 'No vacant units') : 'Property first'} /></SelectTrigger>
              <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name} — {formatUGX(u.rent_amount)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tenant *</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
              <SelectContent>{tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Rent (UGX) *</Label>
            <Input type="number" min={1} value={rentAmount} onChange={e => setRentAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Deposit (UGX)</Label>
            <Input type="number" min={0} value={deposit} onChange={e => setDeposit(e.target.value)} />
          </div>
        </div>
        {leases.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Active Leases ({leases.length})</p>
            {leases.slice(0, 5).map((l: any) => (
              <p key={l.id} className="text-sm text-muted-foreground">
                • {l.tenants?.full_name} → {l.properties?.name} / {l.units?.name} — {formatUGX(l.rent_amount)}
              </p>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Lease'}</Button>
          <Button variant="outline" onClick={onComplete} className="gap-2">
            {leases.length > 0 || done ? 'Continue' : 'Skip for now'} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Step 6: Payment Config ─── */
function PaymentConfigStep({ onComplete, done, progress }: { onComplete: (extra: any) => void; done: boolean; progress: OnboardingProgress | null }) {
  const methods = ['mtn_momo', 'airtel_money', 'cash', 'bank_transfer', 'pesapal'] as const;
  const labels: Record<string, string> = { mtn_momo: 'MTN Mobile Money', airtel_money: 'Airtel Money', cash: 'Cash', bank_transfer: 'Bank Transfer', pesapal: 'Pesapal' };
  const [selected, setSelected] = useState<string[]>(progress?.payment_methods || ['cash']);
  const [saving, setSaving] = useState(false);

  const toggle = (m: string) => {
    setSelected(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSave = async () => {
    if (selected.length === 0) { toast.error('Select at least one payment method'); return; }
    setSaving(true);
    try {
      await onComplete({ payment_methods: selected });
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Payment Configuration</CardTitle>
        <CardDescription>Choose which payment methods your tenants can use</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done && <DoneBanner />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {methods.map(m => (
            <button
              key={m}
              onClick={() => toggle(m)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left
                ${selected.includes(m) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <Checkbox checked={selected.includes(m)} className="pointer-events-none" />
              <span className="font-medium text-sm">{labels[m]}</span>
            </button>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? 'Finishing…' : 'Complete Onboarding'} <Rocket className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Shared ─── */
function DoneBanner() {
  return (
    <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm">
      <CheckCircle2 className="w-4 h-4" /> This step is complete. You can update the details or continue.
    </div>
  );
}
