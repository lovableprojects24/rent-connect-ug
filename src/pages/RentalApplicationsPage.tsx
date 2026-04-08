import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useManagerApplications, useReviewApplication } from '@/hooks/useRentalApplications';
import { formatUGX } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function RentalApplicationsPage() {
  const { user } = useAuth();
  const { data: apps = [], isLoading } = useManagerApplications();
  const reviewMutation = useReviewApplication();

  const [filter, setFilter] = useState<string>('pending');
  const [reviewApp, setReviewApp] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const filtered = filter === 'all' ? apps : apps.filter((a: any) => a.status === filter);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!user || !reviewApp) return;
    await reviewMutation.mutateAsync({
      id: reviewApp.id,
      status,
      reviewedBy: user.id,
      notes: notes.trim() || undefined,
    });
    setReviewApp(null);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Rental Applications</h1>
          <p className="text-muted-foreground">Review and manage tenant applications</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Applications</h3>
          <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app: any) => (
            <div key={app.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-semibold text-lg">{app.full_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      app.status === 'pending' ? 'text-amber-600 bg-amber-50' :
                      app.status === 'approved' ? 'text-green-600 bg-green-50' :
                      'text-red-600 bg-red-50'
                    }`}>
                      {app.status === 'pending' ? <Clock className="w-3 h-3" /> :
                       app.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                       <XCircle className="w-3 h-3" />}
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {app.units?.name} — {app.properties?.name}, {app.properties?.location}
                  </p>
                  <p className="text-sm text-primary font-semibold">{formatUGX(app.units?.rent_amount || 0)}/mo</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{app.phone}</span>
                    {app.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.email}</span>}
                  </div>
                  {app.message && <p className="text-sm italic text-muted-foreground mt-1">"{app.message}"</p>}
                  <p className="text-xs text-muted-foreground">Applied {format(new Date(app.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                {app.status === 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => { setReviewApp(app); setNotes(''); }}>
                    Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewApp} onOpenChange={(o) => !o && setReviewApp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Review Application</DialogTitle>
          </DialogHeader>
          {reviewApp && (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <p><strong>Applicant:</strong> {reviewApp.full_name}</p>
                <p><strong>Phone:</strong> {reviewApp.phone}</p>
                {reviewApp.email && <p><strong>Email:</strong> {reviewApp.email}</p>}
                <p><strong>Unit:</strong> {reviewApp.units?.name} — {reviewApp.properties?.name}</p>
                <p><strong>Rent:</strong> {formatUGX(reviewApp.units?.rent_amount || 0)}/mo</p>
                {reviewApp.message && <p><strong>Message:</strong> "{reviewApp.message}"</p>}
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes for the applicant..." rows={3} />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2"
                  variant="default"
                  onClick={() => handleReview('approved')}
                  disabled={reviewMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  className="flex-1 gap-2"
                  variant="destructive"
                  onClick={() => handleReview('rejected')}
                  disabled={reviewMutation.isPending}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
