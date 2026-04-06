import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  User, Lock, CreditCard, MessageSquare, Building2, FileText, Save, Eye, EyeOff,
} from 'lucide-react';

interface SettingsMap {
  [key: string]: any;
}

export default function SettingsPage() {
  const { user, profile, roles, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // App settings
  const [settings, setSettings] = useState<SettingsMap>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*');
    if (data) {
      const map: SettingsMap = {};
      data.forEach((row: any) => {
        map[row.setting_key] = row.setting_value;
      });
      setSettings(map);
    }
    setSettingsLoading(false);
  };

  // ─── Profile ────────────────────────────────────────────────

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('user_id', user.id);
    setProfileSaving(false);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
  };

  // ─── Password ───────────────────────────────────────────────

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // ─── Settings save ─────────────────────────────────────────

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from('app_settings').update({ setting_value: value }).eq('setting_key', key)
    );
    const results = await Promise.all(promises);
    const hasError = results.some(r => r.error);
    setSettingsSaving(false);
    if (hasError) {
      toast.error('Some settings failed to save');
    } else {
      toast.success('Settings saved');
    }
  };

  const card = 'bg-card rounded-xl border border-border p-5 space-y-4';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <p>You do not have permission to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and system configuration</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="w-3.5 h-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <Lock className="w-3.5 h-3.5" /> Security
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm">
                <CreditCard className="w-3.5 h-3.5" /> Financial
              </TabsTrigger>
              <TabsTrigger value="communication" className="gap-1.5 text-xs sm:text-sm">
                <MessageSquare className="w-3.5 h-3.5" /> Communication
              </TabsTrigger>
              <TabsTrigger value="property" className="gap-1.5 text-xs sm:text-sm">
                <Building2 className="w-3.5 h-3.5" /> Property
              </TabsTrigger>
              <TabsTrigger value="legal" className="gap-1.5 text-xs sm:text-sm">
                <FileText className="w-3.5 h-3.5" /> Legal
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ── Profile Tab ────────────────────────────────── */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <h3 className="font-heading font-semibold">Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ') || 'No role'} disabled className="bg-muted capitalize" />
              </div>
            </div>
            <Button onClick={handleProfileSave} disabled={profileSaving} className="gap-2">
              <Save className="w-4 h-4" /> {profileSaving ? 'Saving…' : 'Save Profile'}
            </Button>
          </motion.div>
        </TabsContent>

        {/* ── Security Tab ───────────────────────────────── */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <h3 className="font-heading font-semibold">Change Password</h3>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPass">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPass"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPass">Confirm Password</Label>
                <Input
                  id="confirmPass"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={passwordSaving || !newPassword || newPassword !== confirmPassword}
              className="gap-2"
            >
              <Lock className="w-4 h-4" /> {passwordSaving ? 'Updating…' : 'Update Password'}
            </Button>
          </motion.div>
        </TabsContent>

        {/* ── Financial Tab ──────────────────────────────── */}
        {isAdmin && (
          <TabsContent value="financial">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={card}>
                <h3 className="font-heading font-semibold">Currency & Tax</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Currency</Label>
                    <Select value={String(settings.currency || 'UGX')} onValueChange={v => updateSetting('currency', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UGX">UGX — Uganda Shilling</SelectItem>
                        <SelectItem value="USD">USD — US Dollar</SelectItem>
                        <SelectItem value="KES">KES — Kenya Shilling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>VAT Rate (%)</Label>
                    <Input
                      type="number"
                      value={settings.vat_rate ?? 18}
                      onChange={e => updateSetting('vat_rate', Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                    <p className="text-xs text-muted-foreground">Standard URA VAT is 18%</p>
                  </div>
                  <div className="space-y-2">
                    <Label>TIN Number</Label>
                    <Input
                      value={String(settings.tin_number || '')}
                      onChange={e => updateSetting('tin_number', e.target.value)}
                      placeholder="Your URA TIN"
                    />
                  </div>
                </div>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">Late Payment Policy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Late Penalty (%)</Label>
                    <Input
                      type="number"
                      value={settings.late_penalty_percent ?? 5}
                      onChange={e => updateSetting('late_penalty_percent', Number(e.target.value))}
                      min={0}
                      max={50}
                    />
                    <p className="text-xs text-muted-foreground">Applied after grace period</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period (days)</Label>
                    <Input
                      type="number"
                      value={settings.grace_period_days ?? 5}
                      onChange={e => updateSetting('grace_period_days', Number(e.target.value))}
                      min={0}
                      max={30}
                    />
                  </div>
                </div>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">Payment Gateways</h3>
                <p className="text-sm text-muted-foreground">
                  Pesapal integration for MTN MoMo, Airtel Money, Visa, and bank payments across East Africa.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🌐</span>
                      <div>
                        <p className="text-sm font-medium">Pesapal</p>
                        <p className="text-xs text-muted-foreground">Mobile money, cards & bank payments</p>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Active</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pesapal Environment</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={String(settings.pesapal_env || 'sandbox')}
                        onChange={e => updateSetting('pesapal_env', e.target.value)}
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">Use Sandbox for testing, switch to Live when ready</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={String(settings.pesapal_currency || 'UGX')}
                        onChange={e => updateSetting('pesapal_currency', e.target.value)}
                      >
                        <option value="UGX">UGX — Uganda Shilling</option>
                        <option value="KES">KES — Kenya Shilling</option>
                        <option value="USD">USD — US Dollar</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    API keys are securely stored in backend settings. To update your Pesapal Consumer Key or Consumer Secret, contact your system administrator.
                  </p>
                </div>
              </div>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Financial Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}

        {/* ── Communication Tab ──────────────────────────── */}
        {isAdmin && (
          <TabsContent value="communication">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={card}>
                <h3 className="font-heading font-semibold">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Reminders</p>
                      <p className="text-xs text-muted-foreground">Send rent reminders and receipts via email</p>
                    </div>
                    <Switch
                      checked={settings.email_reminders_enabled === true || settings.email_reminders_enabled === 'true'}
                      onCheckedChange={v => updateSetting('email_reminders_enabled', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">Automated SMS for rent reminders and late alerts</p>
                    </div>
                    <Switch
                      checked={settings.sms_enabled === true || settings.sms_enabled === 'true'}
                      onCheckedChange={v => updateSetting('sms_enabled', v)}
                    />
                  </div>
                </div>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">Reminder Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Grace Period Before Late Alert (days)</Label>
                    <Input
                      type="number"
                      value={settings.grace_period_days ?? 5}
                      onChange={e => updateSetting('grace_period_days', Number(e.target.value))}
                      min={0}
                      max={30}
                    />
                  </div>
                </div>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">SMS Gateway</h3>
                <p className="text-sm text-muted-foreground">
                  Connect an SMS provider to send automated rent reminders, payment receipts, and announcements to tenants.
                </p>
                <div className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">SMS Provider Integration</p>
                    <p className="text-xs text-muted-foreground">Africa's Talking, Twilio, or local providers</p>
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming soon</span>
                </div>
              </div>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Communication Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}

        {/* ── Property Tab ───────────────────────────────── */}
        {isAdmin && (
          <TabsContent value="property">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={card}>
                <h3 className="font-heading font-semibold">Tenant Portal</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Tenant Self-Service Portal</p>
                    <p className="text-xs text-muted-foreground">Allow tenants to view balances, download receipts, and submit maintenance requests</p>
                  </div>
                  <Switch
                    checked={settings.tenant_portal_enabled === true || settings.tenant_portal_enabled === 'true'}
                    onCheckedChange={v => updateSetting('tenant_portal_enabled', v)}
                  />
                </div>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">Unit Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Unit types (Apartment, Room, Bed) are configured per-property. Visit a property's detail page to manage units and set base rents.
                </p>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">Utility Billing</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how UMEME (electricity) and NWSC (water) bills are split among tenants — sub-metered or flat rate.
                </p>
                <div className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Utility Tracking Module</p>
                    <p className="text-xs text-muted-foreground">UMEME & NWSC bill splitting</p>
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming soon</span>
                </div>
              </div>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Property Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}

        {/* ── Legal Tab ──────────────────────────────────── */}
        {isAdmin && (
          <TabsContent value="legal">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={card}>
                <h3 className="font-heading font-semibold">Lease Expiry Alerts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Alert Before Expiry (months)</Label>
                    <Select
                      value={String(settings.lease_expiry_alert_months ?? 3)}
                      onValueChange={v => updateSetting('lease_expiry_alert_months', Number(v))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 month</SelectItem>
                        <SelectItem value="2">2 months</SelectItem>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Per the Landlord and Tenant Act</p>
                  </div>
                </div>
              </div>

              <div className={card}>
                <h3 className="font-heading font-semibold">Document Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a standard Uganda-compliant lease agreement template that the system can auto-fill with tenant data.
                </p>
                <div className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Lease Agreement Template</p>
                    <p className="text-xs text-muted-foreground">Upload a .docx or .pdf template</p>
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming soon</span>
                </div>
              </div>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Legal Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
