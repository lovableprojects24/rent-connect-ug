import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, FileText, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { kycService, ID_TYPE_LABELS, type KycVerification } from '@/services/kyc';
import KycStatusBadge from './KycStatusBadge';

interface KycReviewPanelProps {
  userId: string;
  reviewerId: string;
  onUpdate?: () => void;
}

export default function KycReviewPanel({ userId, reviewerId, onUpdate }: KycReviewPanelProps) {
  const [kyc, setKyc] = useState<KycVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const loadKyc = async () => {
    setLoading(true);
    const data = await kycService.getByUserId(userId);
    setKyc(data);

    if (data) {
      const urls: Record<string, string> = {};
      for (const key of ['id_front_url', 'id_back_url', 'selfie_url'] as const) {
        if (data[key]) {
          try {
            urls[key] = await kycService.getSignedUrl(data[key]!);
          } catch { /* ignore */ }
        }
      }
      setSignedUrls(urls);
    }
    setLoading(false);
  };

  useEffect(() => { loadKyc(); }, [userId]);

  const handleVerify = async () => {
    if (!kyc) return;
    setProcessing(true);
    try {
      await kycService.verify(kyc.id, reviewerId, notes || undefined);
      toast.success('KYC verified successfully');
      await loadKyc();
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!kyc) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await kycService.reject(kyc.id, reviewerId, rejectionReason);
      toast.success('KYC rejected');
      await loadKyc();
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading KYC data…</div>;
  }

  if (!kyc) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
        <ShieldX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No KYC submission found for this user.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm">KYC Verification</h3>
        <KycStatusBadge status={kyc.status} />
      </div>

      {/* ID Info */}
      <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Document Type</span>
          <span className="font-medium">{ID_TYPE_LABELS[kyc.id_type]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID Number</span>
          <span className="font-mono font-medium">{kyc.id_number}</span>
        </div>
        {kyc.expiry_date && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expiry</span>
            <span>{new Date(kyc.expiry_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Document previews */}
      <div className="grid grid-cols-3 gap-2">
        {(['id_front_url', 'id_back_url', 'selfie_url'] as const).map((key) => {
          const label = key === 'id_front_url' ? 'ID Front' : key === 'id_back_url' ? 'ID Back' : 'Selfie';
          const IconComp = key === 'selfie_url' ? User : FileText;
          const url = signedUrls[key];
          return (
            <div key={key} className="space-y-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block relative group">
                  <img src={url} alt={label} className="w-full h-20 object-cover rounded-md border border-border" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </a>
              ) : (
                <div className="w-full h-20 bg-muted/50 rounded-md border border-border flex items-center justify-center">
                  <IconComp className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions for pending KYC */}
      {kyc.status === 'pending' && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Input
              placeholder="Verification notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Rejection Reason (required if rejecting)</Label>
            <Textarea
              placeholder="Why is this being rejected?"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleVerify}
              disabled={processing}
              className="flex-1 bg-primary hover:bg-primary/90 gap-1.5"
              size="sm"
            >
              <ShieldCheck className="w-4 h-4" /> Verify
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing}
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10 gap-1.5"
              size="sm"
            >
              <ShieldX className="w-4 h-4" /> Reject
            </Button>
          </div>
        </div>
      )}

      {/* Show rejection reason */}
      {kyc.status === 'rejected' && kyc.rejection_reason && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="text-xs font-medium text-destructive mb-1">Rejection Reason</p>
          <p className="text-sm text-foreground">{kyc.rejection_reason}</p>
        </div>
      )}

      {kyc.notes && kyc.status === 'verified' && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-xs font-medium text-primary mb-1">Verification Notes</p>
          <p className="text-sm text-foreground">{kyc.notes}</p>
        </div>
      )}
    </div>
  );
}
