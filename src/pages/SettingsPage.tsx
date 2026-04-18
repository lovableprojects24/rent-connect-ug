import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  User, Lock, CreditCard, MessageSquare, Building2, FileText, Save, Eye, EyeOff, Settings,
} from 'lucide-react';

interface SettingsMap {
  [key: string]: any;
}

export default function SettingsPage() {
  const { user, profile, roles, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [settings, setSettings] = useState<SettingsMap>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*');
    if (data) {
      const map: SettingsMap = {};
      data.forEach((row: any) => { map[row.setting_key] = row.setting_value; });
      setSettings(map);
    }
    setSettingsLoading(false);
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('user_id', user.id);
    setProfileSaving(false);
    error ? toast.error('Failed to update profile') : toast.success('Profile updated');
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) { toast.error(error.message); } else {
      toast.success('Password updated');
      setNewPassword(''); setConfirmPassword('');
    }
  };

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
    hasError ? toast.error('Some settings failed to save') : toast.success('Settings saved');
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <p>You do not have permission to access settings.</p>
      </div>
    );
  }

  const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and system configuration</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-border flex flex-wrap h-auto gap-1 p-1.5 rounded-xl">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-3.5 h-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lock className="w-3.5 h-3.5" /> Security
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="w-3.5 h-3.5" /> Financial
              </TabsTrigger>
              <TabsTrigger value="communication" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="w-3.5 h-3.5" /> Communication
              </TabsTrigger>
              <TabsTrigger value="property" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="w-3.5 h-3.5" /> Property
              </TabsTrigger>
              <TabsTrigger value="legal" className="gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-3.5 h-3.5" /> Legal
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <motion.div {...anim}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <motion.div {...anim}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Financial */}
        {isAdmin && (
          <TabsContent value="financial">
            <motion.div {...anim} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Currency & Tax</CardTitle>
                  <CardDescription>Configure financial defaults for your properties</CardDescription>
                </CardHeader>
                <CardContent>
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
                      <Input type="number" value={settings.vat_rate ?? 18} onChange={e => updateSetting('vat_rate', Number(e.target.value))} min={0} max={100} />
                      <p className="text-xs text-muted-foreground">Standard URA VAT is 18%</p>
                    </div>
                    <div className="space-y-2">
                      <Label>TIN Number</Label>
                      <Input value={String(settings.tin_number || '')} onChange={e => updateSetting('tin_number', e.target.value)} placeholder="Your URA TIN" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Late Payment Policy</CardTitle>
                  <CardDescription>Set penalties and grace periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Late Penalty (%)</Label>
                      <Input type="number" value={settings.late_penalty_percent ?? 5} onChange={e => updateSetting('late_penalty_percent', Number(e.target.value))} min={0} max={50} />
                      <p className="text-xs text-muted-foreground">Applied after grace period</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (days)</Label>
                      <Input type="number" value={settings.grace_period_days ?? 5} onChange={e => updateSetting('grace_period_days', Number(e.target.value))} min={0} max={30} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Gateways</CardTitle>
                  <CardDescription>Pesapal integration for MTN MoMo, Airtel Money, Visa, and bank payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border border-border rounded-xl p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pesapal</p>
                        <p className="text-xs text-muted-foreground">Mobile money, cards & bank payments</p>
                      </div>
                    </div>
                    <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium">Active</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pesapal Environment</Label>
                      <Select value={String(settings.pesapal_env || 'sandbox')} onValueChange={v => updateSetting('pesapal_env', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                          <SelectItem value="live">Live (Production)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Use Sandbox for testing, switch to Live when ready</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <Select value={String(settings.pesapal_currency || 'UGX')} onValueChange={v => updateSetting('pesapal_currency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UGX">UGX — Uganda Shilling</SelectItem>
                          <SelectItem value="KES">KES — Kenya Shilling</SelectItem>
                          <SelectItem value="USD">USD — US Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    API keys are securely stored in backend settings. Contact your system administrator to update credentials.
                  </p>
                </CardContent>
              </Card>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Financial Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}

        {/* Communication */}
        {isAdmin && (
          <TabsContent value="communication">
            <motion.div {...anim} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <CardDescription>Control how tenants receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="text-sm font-medium">Email Reminders</p>
                      <p className="text-xs text-muted-foreground">Send rent reminders and receipts via email</p>
                    </div>
                    <Switch
                      checked={settings.email_reminders_enabled === true || settings.email_reminders_enabled === 'true'}
                      onCheckedChange={v => updateSetting('email_reminders_enabled', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="text-sm font-medium">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">Automated SMS for rent reminders and late alerts</p>
                    </div>
                    <Switch
                      checked={settings.sms_enabled === true || settings.sms_enabled === 'true'}
                      onCheckedChange={v => updateSetting('sms_enabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reminder Schedule</CardTitle>
                  <CardDescription>Configure when alerts are triggered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-sm space-y-2">
                    <Label>Grace Period Before Late Alert (days)</Label>
                    <Input type="number" value={settings.grace_period_days ?? 5} onChange={e => updateSetting('grace_period_days', Number(e.target.value))} min={0} max={30} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SMS Gateway</CardTitle>
                  <CardDescription>Connect an SMS provider for automated messaging</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between border border-border rounded-xl p-4 bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">SMS Provider Integration</p>
                      <p className="text-xs text-muted-foreground">Africa's Talking, Twilio, or local providers</p>
                    </div>
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">Coming soon</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Communication Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}

        {/* Property */}
        {isAdmin && (
          <TabsContent value="property">
            <motion.div {...anim} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tenant Portal</CardTitle>
                  <CardDescription>Self-service access for tenants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="text-sm font-medium">Enable Tenant Self-Service Portal</p>
                      <p className="text-xs text-muted-foreground">Allow tenants to view balances, download receipts, and submit maintenance requests</p>
                    </div>
                    <Switch
                      checked={settings.tenant_portal_enabled === true || settings.tenant_portal_enabled === 'true'}
                      onCheckedChange={v => updateSetting('tenant_portal_enabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unit Configuration</CardTitle>
                  <CardDescription>Manage unit types per property</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Unit types (Apartment, Room, Bed) are configured per-property. Visit a property's detail page to manage units and set base rents.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Utility Billing</CardTitle>
                  <CardDescription>UMEME & NWSC bill splitting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between border border-border rounded-xl p-4 bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Utility Tracking Module</p>
                      <p className="text-xs text-muted-foreground">UMEME & NWSC bill splitting</p>
                    </div>
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">Coming soon</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSettingsSave} disabled={settingsSaving} className="gap-2">
                <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save Property Settings'}
              </Button>
            </motion.div>
          </TabsContent>
        )}

        {/* Legal */}
        {isAdmin && (
          <TabsContent value="legal">
            <motion.div {...anim} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allocation Expiry Alerts</CardTitle>
                  <CardDescription>Configure automatic allocation renewal reminders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-sm space-y-2">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Templates</CardTitle>
                  <CardDescription>Standard Uganda-compliant allocation templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between border border-border rounded-xl p-4 bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Allocation Agreement Template</p>
                      <p className="text-xs text-muted-foreground">Upload a .docx or .pdf template</p>
                    </div>
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">Coming soon</span>
                  </div>
                </CardContent>
              </Card>

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
