import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Users, Phone, Mail, ArrowRight, Minus, Plus, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type View = 'choose' | 'login' | 'request';
type AccountType = 'landlord' | 'tenant';

const descriptions = [
  'I manage my own rental(s)',
  'I manage rentals for others',
  'I manage a mix of both',
  "I don't manage any rentals yet",
  "I'm an apartment or rental broker",
];

const experienceOptions = [
  'Less than a year',
  '1-4 years',
  '5-10 years',
  'More than 10 years',
  "I don't manage any rentals yet",
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors = ['bg-destructive', 'bg-warning', 'bg-[#d4a843]', 'bg-[#2d8f4e]'];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? colors[strength - 1] : 'bg-border'}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password must be at least 8 characters and contain 1 number, both upper & lowercase letters
      </p>
    </div>
  );
}

export default function AuthPage() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request / Signup form
  const [accountType, setAccountType] = useState<AccountType>('landlord');
  const [description, setDescription] = useState('');
  const [unitCount, setUnitCount] = useState(0);
  const [experience, setExperience] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPassword, setReqPassword] = useState('');
  const [showReqPassword, setShowReqPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [requested, setRequested] = useState(false);
  const [tenantMessage, setTenantMessage] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (session) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reqPassword.length < 8 || !/[A-Z]/.test(reqPassword) || !/[a-z]/.test(reqPassword) || !/[0-9]/.test(reqPassword)) {
      toast.error('Password must be at least 8 characters with upper, lower case and a number');
      return;
    }
    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reqEmail.trim(),
        password: reqPassword,
        options: {
          data: { full_name: fullName },
        },
      });
      if (authError) throw authError;

      // 2. Save onboarding request for admin review
      await supabase.from('onboarding_requests').insert({
        full_name: fullName,
        email: reqEmail.trim(),
        phone: reqPhone.trim(),
        account_type: accountType,
        description,
        unit_count: unitCount,
        experience,
      });

      // 3. Update profile with phone
      if (authData.user) {
        await supabase.from('profiles').update({
          phone: reqPhone.trim(),
          full_name: fullName,
        }).eq('user_id', authData.user.id);
      }

      setRequested(true);
      toast.success('Account created! Pending admin approval.');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTenantRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await supabase.from('onboarding_requests').insert({
        full_name: fullName,
        email: reqEmail.trim(),
        phone: reqPhone.trim(),
        account_type: 'tenant',
        message: tenantMessage.trim() || null,
      });
      setRequested(true);
      toast.success('Request submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = description && experience;
  const isPasswordValid = reqPassword.length >= 8 && /[A-Z]/.test(reqPassword) && /[a-z]/.test(reqPassword) && /[0-9]/.test(reqPassword);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="flex-1 flex items-start justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Building2 className="w-7 h-7 text-[#2d8f4e]" />
            <span className="font-heading font-bold text-xl text-foreground">
              Rent<span className="text-[#2d8f4e]">Flow</span>
            </span>
          </div>

          {/* ── Choose view ── */}
          {view === 'choose' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Welcome to RentFlow</h1>
              <p className="text-muted-foreground mb-8">Choose how you'd like to proceed.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setView('login')}
                  className="group border-2 border-border rounded-xl p-6 text-center hover:border-[#2d8f4e] hover:bg-[#f0faf3] transition-all">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#2d8f4e]/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-[#2d8f4e]" />
                  </div>
                  <p className="font-heading font-semibold text-foreground text-sm">I have an account</p>
                  <p className="text-xs text-muted-foreground mt-1">Sign in to your portal</p>
                </button>

                <button onClick={() => setView('request')}
                  className="group border-2 border-border rounded-xl p-6 text-center hover:border-[#d4a843] hover:bg-[#fdf8ef] transition-all relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#d4a843] text-white text-[10px] font-semibold px-3 py-0.5 rounded-full">
                    New here?
                  </span>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#d4a843]/10 flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#d4a843]" />
                  </div>
                  <p className="font-heading font-semibold text-foreground text-sm">Create Account</p>
                  <p className="text-xs text-muted-foreground mt-1">Start your free trial</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Login view ── */}
          {view === 'login' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <button onClick={() => setView('choose')} className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1">← Back</button>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Sign In</h1>
              <p className="text-muted-foreground mb-6">Enter your credentials to continue.</p>

              {/* Google */}
              <button onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-3 hover:bg-muted/50 transition-colors mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium text-foreground">Continue with Google</span>
              </button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Email <span className="text-destructive">*</span></label>
                  <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required />
                </div>
                <div className="relative">
                  <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Password <span className="text-destructive">*</span></label>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm pr-10" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.3rem] text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-[#2d8f4e] hover:bg-[#24733f] text-white h-12 text-sm font-semibold">
                  {submitting ? 'Signing in...' : 'Sign In'}{!submitting && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>
              <p className="text-center mt-6 text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button onClick={() => setView('request')} className="text-[#2d8f4e] hover:underline font-medium">Create one</button>
              </p>
            </motion.div>
          )}

          {/* ── Signup flow ── */}
          {view === 'request' && !requested && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <button onClick={() => { if (step === 2) setStep(1); else setView('choose'); }}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1">← Back</button>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-[#2d8f4e]' : 'bg-border'}`} />
                <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-[#2d8f4e]' : 'bg-border'}`} />
              </div>

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Account type</h1>
                  <p className="text-muted-foreground mb-6 text-sm">Choose the user account type that suits your needs.</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setAccountType('landlord')}
                      className={`border-2 rounded-xl p-5 text-center transition-all relative ${accountType === 'landlord' ? 'border-[#2d8f4e] bg-[#f0faf3]' : 'border-border hover:border-muted-foreground/30'}`}>
                      {accountType === 'landlord' && <CheckCircle2 className="w-5 h-5 text-[#2d8f4e] absolute top-3 right-3" />}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2d8f4e]/10 text-[#2d8f4e]">Free 14-day trial</span>
                      <div className="w-12 h-12 mx-auto my-3 rounded-full bg-[#2d8f4e]/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#2d8f4e]" />
                      </div>
                      <p className="font-heading font-semibold text-foreground text-sm">I'm a Landlord</p>
                    </button>
                    <button onClick={() => setAccountType('tenant')}
                      className={`border-2 rounded-xl p-5 text-center transition-all relative ${accountType === 'tenant' ? 'border-[#2d8f4e] bg-[#f0faf3]' : 'border-border hover:border-muted-foreground/30'}`}>
                      {accountType === 'tenant' && <CheckCircle2 className="w-5 h-5 text-[#2d8f4e] absolute top-3 right-3" />}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Free account</span>
                      <div className="w-12 h-12 mx-auto my-3 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-heading font-semibold text-foreground text-sm">I'm a Tenant</p>
                    </button>
                  </div>

                  {accountType === 'landlord' && (
                    <>
                      <div className="mb-6">
                        <p className="font-medium text-sm text-foreground mb-3">Which best describes you? <span className="text-destructive">*</span></p>
                        <div className="space-y-2">
                          {descriptions.map((d) => (
                            <button type="button" key={d} onClick={() => setDescription(d)} className="flex items-center gap-3 cursor-pointer group w-full text-left">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${description === d ? 'border-[#2d8f4e]' : 'border-border group-hover:border-muted-foreground'}`}>
                                {description === d && <div className="w-2 h-2 rounded-full bg-[#2d8f4e]" />}
                              </div>
                              <span className="text-sm text-foreground">{d}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="font-medium text-sm text-foreground mb-3">How many units do you own/manage? <span className="text-destructive">*</span></p>
                        <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
                          <button type="button" onClick={() => setUnitCount(Math.max(0, unitCount - 1))} className="px-3 py-2 hover:bg-muted transition-colors text-muted-foreground"><Minus className="w-4 h-4" /></button>
                          <span className="px-5 py-2 border-x border-border text-sm font-medium min-w-[3rem] text-center">{unitCount}</span>
                          <button type="button" onClick={() => setUnitCount(unitCount + 1)} className="px-3 py-2 hover:bg-muted transition-colors text-[#2d8f4e]"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="mb-8">
                        <p className="font-medium text-sm text-foreground mb-3">How long have you managed rentals? <span className="text-destructive">*</span></p>
                        <div className="space-y-2">
                          {experienceOptions.map((exp) => (
                            <button type="button" key={exp} onClick={() => setExperience(exp)} className="flex items-center gap-3 cursor-pointer group w-full text-left">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${experience === exp ? 'border-[#2d8f4e]' : 'border-border group-hover:border-muted-foreground'}`}>
                                {experience === exp && <div className="w-2 h-2 rounded-full bg-[#2d8f4e]" />}
                              </div>
                              <span className="text-sm text-foreground">{exp}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full bg-[#2d8f4e] hover:bg-[#24733f] text-white h-12 text-sm font-semibold disabled:opacity-40">
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {accountType === 'tenant' && (
                    <>
                      <div className="bg-[#fdf8ef] border border-[#d4a843]/30 rounded-xl p-5 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#d4a843]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Phone className="w-5 h-5 text-[#d4a843]" />
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-foreground text-sm mb-1">Tenant accounts are created by your landlord</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Your landlord or property manager will set up your account and provide you with login credentials. If you need access, please contact them or reach out to us.
                            </p>
                          </div>
                        </div>
                      </div>

                      <h2 className="font-heading text-lg font-bold text-foreground mb-1">Request Access</h2>
                      <p className="text-muted-foreground text-sm mb-5">Fill in your details and we'll connect you with your property manager.</p>

                      <form onSubmit={handleTenantRequest} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">First name <span className="text-destructive">*</span></label>
                            <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={50} />
                          </div>
                          <div>
                            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Last name <span className="text-destructive">*</span></label>
                            <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={50} />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Email <span className="text-destructive">*</span></label>
                          <input type="email" placeholder="Enter your email" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={255} />
                        </div>
                        <div>
                          <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Phone number <span className="text-destructive">*</span></label>
                          <input type="tel" placeholder="Enter your phone number" value={reqPhone} onChange={(e) => setReqPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={20} />
                        </div>
                        <div>
                          <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Message <span className="text-muted-foreground">(optional)</span></label>
                          <textarea placeholder="e.g. I'm a tenant at Sunshine Apartments, Unit 4B..." value={tenantMessage} onChange={(e) => setTenantMessage(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm resize-none" rows={3} maxLength={500} />
                        </div>
                        <Button type="submit" disabled={submitting} className="w-full bg-[#d4a843] hover:bg-[#c49a3a] text-white h-12 text-sm font-semibold">
                          {submitting ? 'Submitting...' : 'Submit Request'} {!submitting && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                      </form>

                      <div className="mt-5 text-center">
                        <p className="text-xs text-muted-foreground">Already have credentials from your landlord?</p>
                        <button onClick={() => setView('login')} className="text-[#2d8f4e] hover:underline font-medium text-xs mt-1">Sign in here</button>
                      </div>
                    </>
                  )}

                  <p className="text-center mt-6 text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <button onClick={() => setView('login')} className="text-[#2d8f4e] hover:underline font-medium">Sign in</button>
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Start your free 14-day trial</h1>
                  <p className="text-muted-foreground mb-6 text-sm">Enter your details to continue.</p>

                  {/* Google */}
                  <button onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-3 hover:bg-muted/50 transition-colors mb-4">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-sm font-medium text-foreground">Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">Or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Email <span className="text-destructive">*</span></label>
                      <input type="email" placeholder="Enter your email" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={255} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1.5 text-xs font-medium text-muted-foreground">First name <span className="text-destructive">*</span></label>
                        <input type="text" placeholder="Enter your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={50} />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Last name <span className="text-destructive">*</span></label>
                        <input type="text" placeholder="Enter your last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={50} />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Phone number <span className="text-destructive">*</span></label>
                      <input type="tel" placeholder="Enter your phone number" value={reqPhone} onChange={(e) => setReqPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm" required maxLength={20} />
                    </div>
                    <div className="relative">
                      <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Password <span className="text-destructive">*</span></label>
                      <input type={showReqPassword ? 'text' : 'password'} placeholder="Enter your password" value={reqPassword} onChange={(e) => setReqPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm pr-10" required minLength={8} />
                      <button type="button" onClick={() => setShowReqPassword(!showReqPassword)}
                        className="absolute right-3 top-[2.1rem] text-muted-foreground hover:text-foreground">
                        {showReqPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <PasswordStrength password={reqPassword} />
                    </div>

                    <Button type="submit" disabled={submitting || !isPasswordValid}
                      className="w-full bg-[#2d8f4e] hover:bg-[#24733f] text-white h-12 text-sm font-semibold disabled:opacity-40">
                      {submitting ? 'Creating account...' : 'Start my free trial'}
                    </Button>
                  </form>

                  <p className="text-center mt-5 text-xs text-muted-foreground">
                    By creating an account you agree to our{' '}
                    <a href="#" className="text-[#2d8f4e] hover:underline">Terms and Conditions</a>{' & '}
                    <a href="#" className="text-[#2d8f4e] hover:underline">Privacy Policy</a>.
                  </p>

                  <p className="text-center mt-3 text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <button onClick={() => setView('login')} className="text-[#2d8f4e] hover:underline font-medium">Sign in</button>
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Success view ── */}
          {view === 'request' && requested && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2d8f4e]/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#2d8f4e]" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Account Created! 🎉</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Your account has been created and is pending admin approval. You'll be notified once your account is activated.
              </p>
              <div className="bg-[#f0faf3] rounded-lg p-4 text-sm text-foreground mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-[#2d8f4e]" />
                  <span className="font-medium">+256 703 911851</span>
                </div>
                <p className="text-xs text-muted-foreground">You can also reach us directly</p>
              </div>
              <Button onClick={() => { setView('login'); setRequested(false); setStep(1); }} className="bg-[#2d8f4e] hover:bg-[#24733f] text-white">
                Go to Sign In
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#f0faf3] to-[#e8f5ec] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#2d8f4e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-[#d4a843]/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-lg text-center">
          <p className="text-[#2d8f4e] font-semibold text-sm uppercase tracking-wider mb-3">Property Management Portal</p>
          <h2 className="font-heading text-3xl font-bold text-foreground leading-snug mb-8">Manage your rental portfolio with ease</h2>
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border bg-white">
              <img src="/screenshots/dashboard.png" alt="RentFlow Dashboard" className="w-full" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-56 rounded-lg overflow-hidden shadow-xl border border-border bg-white">
              <img src="/screenshots/payments.png" alt="RentFlow Payments" className="w-full" />
            </div>
            <div className="absolute -bottom-2 -right-4 bg-white rounded-lg shadow-xl border border-border p-4 text-left">
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              <p className="font-heading text-lg font-bold text-[#2d8f4e]">UGX 12.5M</p>
              <p className="text-xs text-[#2d8f4e]">↑ 98% collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
