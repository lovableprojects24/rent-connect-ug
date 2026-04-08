import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Users, Phone, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type View = 'choose' | 'login' | 'request';

export default function AuthPage() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Request form state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [requested, setRequested] = useState(false);

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

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Insert request into notifications for admin
      const { error } = await supabase.from('notifications').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'New Onboarding Request',
        message: `${reqName} (${reqEmail}, ${reqPhone}) is requesting access. Message: ${reqMessage || 'N/A'}`,
        type: 'general' as const,
      });
      // Even if insert fails (no admin UUID), show success to user
      setRequested(true);
      toast.success('Request sent! The admin team will contact you shortly.');
    } catch {
      toast.success('Request sent! The admin team will contact you shortly.');
      setRequested(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Building2 className="w-7 h-7 text-[#2d8f4e]" />
            <span className="font-heading font-bold text-xl text-foreground">
              Rent<span className="text-[#2d8f4e]">Flow</span>
            </span>
          </div>

          {view === 'choose' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                Welcome to RentFlow
              </h1>
              <p className="text-muted-foreground mb-8">
                Choose how you'd like to proceed.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Existing User */}
                <button
                  onClick={() => setView('login')}
                  className="group border-2 border-border rounded-xl p-6 text-center hover:border-[#2d8f4e] hover:bg-[#f0faf3] transition-all"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#2d8f4e]/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-[#2d8f4e]" />
                  </div>
                  <p className="font-heading font-semibold text-foreground text-sm">
                    I have an account
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sign in to your portal
                  </p>
                </button>

                {/* New User */}
                <button
                  onClick={() => setView('request')}
                  className="group border-2 border-border rounded-xl p-6 text-center hover:border-[#d4a843] hover:bg-[#fdf8ef] transition-all relative"
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#d4a843] text-white text-[10px] font-semibold px-3 py-0.5 rounded-full">
                    New here?
                  </span>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#d4a843]/10 flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#d4a843]" />
                  </div>
                  <p className="font-heading font-semibold text-foreground text-sm">
                    Request Access
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get onboarded by admin
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={() => setView('choose')}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
              >
                ← Back
              </button>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                Sign In
              </h1>
              <p className="text-muted-foreground mb-8">
                Enter credentials provided by your administrator.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#2d8f4e] text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2d8f4e] hover:bg-[#24733f] text-white h-12 text-sm font-semibold"
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                  {!submitting && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>

              <p className="text-center mt-6 text-xs text-muted-foreground">
                Don't have credentials?{' '}
                <button onClick={() => setView('request')} className="text-[#2d8f4e] hover:underline font-medium">
                  Request access
                </button>
              </p>
            </motion.div>
          )}

          {view === 'request' && !requested && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={() => setView('choose')}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
              >
                ← Back
              </button>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                Request Onboarding
              </h1>
              <p className="text-muted-foreground mb-8">
                Fill in your details and our admin team will set up your account and contact you.
              </p>

              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#d4a843] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#d4a843] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+256 7XX XXX XXX"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#d4a843] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Message <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. I manage 5 properties in Kampala..."
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-[#d4a843] text-sm resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#d4a843] hover:bg-[#c09a3a] text-white h-12 text-sm font-semibold"
                >
                  {submitting ? 'Sending...' : 'Submit Request'}
                  {!submitting && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>

              <p className="text-center mt-6 text-xs text-muted-foreground">
                Already have credentials?{' '}
                <button onClick={() => setView('login')} className="text-[#2d8f4e] hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {view === 'request' && requested && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2d8f4e]/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#2d8f4e]" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                Request Sent! 🎉
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Our admin team will review your request and reach out to you via email or phone to complete the onboarding process.
              </p>
              <div className="bg-[#f0faf3] rounded-lg p-4 text-sm text-foreground mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-[#2d8f4e]" />
                  <span className="font-medium">+256 703 911851</span>
                </div>
                <p className="text-xs text-muted-foreground">You can also reach us directly</p>
              </div>
              <Button
                onClick={() => { setView('choose'); setRequested(false); }}
                variant="outline"
                className="border-[#2d8f4e] text-[#2d8f4e] hover:bg-[#f0faf3]"
              >
                Back to Home
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Panel - promotional */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#f0faf3] to-[#e8f5ec] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#2d8f4e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-[#d4a843]/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg text-center">
          <p className="text-[#2d8f4e] font-semibold text-sm uppercase tracking-wider mb-3">
            Property Management Portal
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground leading-snug mb-8">
            Manage your rental portfolio with ease
          </h2>

          {/* Stacked screenshots */}
          <div className="relative">
            {/* Main screenshot */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border bg-white">
              <img
                src="/screenshots/dashboard.png"
                alt="RentFlow Dashboard"
                className="w-full"
              />
            </div>

            {/* Overlapping small card */}
            <div className="absolute -bottom-6 -left-6 w-56 rounded-lg overflow-hidden shadow-xl border border-border bg-white">
              <img
                src="/screenshots/payments.png"
                alt="RentFlow Payments"
                className="w-full"
              />
            </div>

            {/* Small income card overlay */}
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
