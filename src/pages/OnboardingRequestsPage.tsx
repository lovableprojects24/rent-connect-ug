import { useEffect, useState } from 'react';
import { UserPlus, CheckCircle, XCircle, Clock, Building2, Users, Mail, Phone, ShieldCheck } from 'lucide-react';
import KycReviewPanel from '@/components/kyc/KycReviewPanel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type OnboardingRequest = Tables<'onboarding_requests'>;
type RequestStatus = Database['public']['Enums']['request_status'];

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-[#d4a843]/10 text-[#d4a843]', icon: Clock },
  approved: { label: 'Approved', color: 'bg-[#2d8f4e]/10 text-[#2d8f4e]', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function OnboardingRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [kycReviewId, setKycReviewId] = useState<string | null>(null);
  const [kycReviewUserId, setKycReviewUserId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('onboarding_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('onboarding_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      // If approving, also approve the user's profile and assign proper role
      if (status === 'approved') {
        const request = requests.find(r => r.id === id);
        if (request?.email) {
          const { data: userId } = await supabase.rpc('find_user_by_email', { _email: request.email });
          if (userId) {
            await supabase.from('profiles').update({ is_approved: true }).eq('user_id', userId);

            // Landlord applicants get admin role (they become property admins)
            if (request.account_type === 'landlord') {
              // Remove default tenant role, keep landlord, add admin
              await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'tenant');
              await supabase.from('user_roles').upsert(
                { user_id: userId, role: 'admin' as any },
                { onConflict: 'user_id,role' }
              );
              await supabase.from('user_roles').upsert(
                { user_id: userId, role: 'landlord' as any },
                { onConflict: 'user_id,role' }
              );
            }
          }
        }
      }

      toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'}`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl mb-2">Onboarding Requests</h1>
        <p className="text-muted-foreground">Review and manage account requests from new users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { key: 'all', label: 'Total', icon: Users, color: 'text-foreground' },
          { key: 'pending', label: 'Pending', icon: Clock, color: 'text-[#d4a843]' },
          { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-[#2d8f4e]' },
          { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-destructive' },
        ] as const).map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-card border rounded-xl p-5 text-left transition-all ${filter === key ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-heading font-semibold">{counts[key]}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Requests Found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'No onboarding requests yet' : `No ${filter} requests`}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Applicant</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Details</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const sc = statusConfig[req.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm">
                            {req.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{req.full_name}</p>
                            {req.message && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={req.message}>
                                "{req.message}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="truncate max-w-[180px]">{req.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{req.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          req.account_type === 'landlord' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {req.account_type === 'landlord' ? <Building2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {req.account_type === 'landlord' ? 'Landlord' : 'Tenant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {req.account_type === 'landlord' ? (
                          <div className="space-y-0.5">
                            {req.unit_count != null && <p>{req.unit_count} units</p>}
                            {req.experience && <p>{req.experience}</p>}
                          </div>
                        ) : (
                          <span className="text-xs italic">Contact request</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const { data: uid } = await supabase.rpc('find_user_by_email', { _email: req.email });
                                if (uid) {
                                  setKycReviewId(req.id);
                                  setKycReviewUserId(uid);
                                } else {
                                  toast.error('User account not found for KYC review');
                                }
                              }}
                              className="h-8 text-xs gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> KYC
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(req.id, 'approved')}
                              disabled={processing === req.id}
                              className="bg-[#2d8f4e] hover:bg-[#24733f] text-white h-8 text-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(req.id, 'rejected')}
                              disabled={processing === req.id}
                              className="border-destructive text-destructive hover:bg-destructive/10 h-8 text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            {req.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Review Dialog */}
      {kycReviewUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setKycReviewId(null); setKycReviewUserId(null); }}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg">KYC Review</h2>
              <Button variant="ghost" size="sm" onClick={() => { setKycReviewId(null); setKycReviewUserId(null); }}>✕</Button>
            </div>
            <KycReviewPanel
              userId={kycReviewUserId}
              reviewerId={user?.id || ''}
              onUpdate={() => { setKycReviewId(null); setKycReviewUserId(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
