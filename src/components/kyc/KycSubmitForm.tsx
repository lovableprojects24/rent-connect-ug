import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, FileText, Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { kycService, ID_TYPE_LABELS, type IdDocumentType, type KycVerification } from '@/services/kyc';

interface KycSubmitFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const KYC_UPLOAD_LOCK_KEY = 'kyc_upload_lock';
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 min stale-lock timeout

function acquireUploadLock(userId: string): boolean {
  try {
    const raw = localStorage.getItem(KYC_UPLOAD_LOCK_KEY);
    if (raw) {
      const lock = JSON.parse(raw);
      if (lock.userId === userId && Date.now() - lock.ts < LOCK_TTL_MS) {
        return false; // already locked by this user in another tab
      }
    }
    localStorage.setItem(KYC_UPLOAD_LOCK_KEY, JSON.stringify({ userId, ts: Date.now() }));
    return true;
  } catch {
    return true; // fail-open if storage unavailable
  }
}

function releaseUploadLock() {
  try { localStorage.removeItem(KYC_UPLOAD_LOCK_KEY); } catch {}
}

type FileUploadStatus = 'idle' | 'queued' | 'uploading' | 'done' | 'failed';

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out — please check your connection and try again`)), ms)
    ),
  ]);
}

async function withRetry<T>(fn: () => Promise<T>, label: string, retries = 2, delayMs = 1000, timeoutMs = 30000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs, label);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error('Unexpected retry failure');
}

export default function KycSubmitForm({ userId, onSuccess, onCancel }: KycSubmitFormProps) {
  const [idType, setIdType] = useState<IdDocumentType>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');
  const [failedStep, setFailedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  // Per-file upload status
  const [frontStatus, setFrontStatus] = useState<FileUploadStatus>('idle');
  const [backStatus, setBackStatus] = useState<FileUploadStatus>('idle');
  const [selfieStatus, setSelfieStatus] = useState<FileUploadStatus>('idle');

  // Server-side saved paths (already uploaded)
  const [savedFront, setSavedFront] = useState<string | null>(null);
  const [savedBack, setSavedBack] = useState<string | null>(null);
  const [savedSelfie, setSavedSelfie] = useState<string | null>(null);

  // Load existing draft on mount
  useEffect(() => {
    kycService.getByUserId(userId).then((draft) => {
      if (draft && draft.status !== 'verified') {
        setIdType(draft.id_type);
        setIdNumber(draft.id_number || '');
        setExpiryDate(draft.expiry_date || '');
        setSavedFront(draft.id_front_url);
        setSavedBack(draft.id_back_url);
        setSavedSelfie(draft.selfie_url);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || cancelledRef.current) return;
    if (!idNumber.trim() || idNumber.trim().length < 5) {
      toast.error('A valid ID number is required (at least 5 characters)');
      return;
    }
    if (!expiryDate) {
      toast.error('Expiry date is required');
      return;
    }
    if (!frontFile && !savedFront) {
      toast.error('Front of ID document is required');
      return;
    }
    if (!backFile && !savedBack) {
      toast.error('Back of ID document is required');
      return;
    }
    if (!selfieFile && !savedSelfie) {
      toast.error('A selfie photo is required');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setFailedStep(null);
    cancelledRef.current = false;

    // Set initial per-file statuses
    setFrontStatus(frontFile ? 'queued' : (savedFront ? 'done' : 'idle'));
    setBackStatus(backFile ? 'queued' : (savedBack ? 'done' : 'idle'));
    setSelfieStatus(selfieFile ? 'queued' : (savedSelfie ? 'done' : 'idle'));

    let frontPath = savedFront;
    let backPath = savedBack;
    let selfiePath = savedSelfie;

    const checkCancelled = () => {
      if (cancelledRef.current) throw new Error('__cancelled__');
    };

    try {
      // Upload front
      if (frontFile) {
        checkCancelled();
        setFrontStatus('uploading');
        setUploadLabel('Uploading ID front…');
        setUploadProgress(10);
        frontPath = await withRetry(
          () => kycService.uploadDocument(userId, frontFile, 'front'),
          'ID front upload'
        );
        await kycService.saveDraft({ user_id: userId, id_type: idType, id_number: idNumber.trim(), id_front_url: frontPath, expiry_date: expiryDate });
        setSavedFront(frontPath);
        setFrontStatus('done');
      }

      // Upload back
      if (backFile) {
        checkCancelled();
        setBackStatus('uploading');
        setUploadLabel('Uploading ID back…');
        setUploadProgress(35);
        backPath = await withRetry(
          () => kycService.uploadDocument(userId, backFile, 'back'),
          'ID back upload'
        );
        await kycService.saveDraft({ user_id: userId, id_type: idType, id_number: idNumber.trim(), id_back_url: backPath, expiry_date: expiryDate });
        setSavedBack(backPath);
        setBackStatus('done');
      }

      // Upload selfie
      if (selfieFile) {
        checkCancelled();
        setSelfieStatus('uploading');
        setUploadLabel('Uploading selfie…');
        setUploadProgress(60);
        selfiePath = await withRetry(
          () => kycService.uploadDocument(userId, selfieFile, 'selfie'),
          'Selfie upload'
        );
        await kycService.saveDraft({ user_id: userId, id_type: idType, id_number: idNumber.trim(), selfie_url: selfiePath, expiry_date: expiryDate });
        setSavedSelfie(selfiePath);
        setSelfieStatus('done');
      }

      // Final submit
      checkCancelled();
      setUploadLabel('Submitting KYC…');
      setUploadProgress(85);

      await withRetry(
        () => kycService.submit({
          user_id: userId,
          id_type: idType,
          id_number: idNumber.trim(),
          id_front_url: frontPath!,
          id_back_url: backPath!,
          selfie_url: selfiePath!,
          expiry_date: expiryDate,
        }),
        'KYC submission'
      );

      setUploadProgress(100);
      toast.success('KYC documents submitted for verification');
      onSuccess();
    } catch (error: any) {
      if (error.message === '__cancelled__') {
        toast.info('Upload cancelled. Already-uploaded files have been saved.');
      } else {
        // Mark the currently-uploading file as failed
        setFrontStatus((s) => s === 'uploading' ? 'failed' : s);
        setBackStatus((s) => s === 'uploading' ? 'failed' : s);
        setSelfieStatus((s) => s === 'uploading' ? 'failed' : s);
        // Mark remaining queued files back to idle
        setFrontStatus((s) => s === 'queued' ? 'idle' : s);
        setBackStatus((s) => s === 'queued' ? 'idle' : s);
        setSelfieStatus((s) => s === 'queued' ? 'idle' : s);

        const msg = error.message || 'Failed to submit KYC';
        setFailedStep(msg);
        toast.error(msg, { description: 'Your progress has been saved. You can retry from where you left off.' });
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
      setUploadLabel('');
    }
  };

  const handleCancelUpload = () => {
    cancelledRef.current = true;
    setFrontFile(null);
    setBackFile(null);
    setSelfieFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading KYC progress…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>ID Document Type *</Label>
        <Select value={idType} onValueChange={(v) => setIdType(v as IdDocumentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ID_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ID Number *</Label>
        <Input
          placeholder="e.g. CM12345678901"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Expiry Date *</Label>
        <Input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FileUploadBox
          label="ID Front *"
          icon={FileText}
          file={frontFile}
          onFileChange={setFrontFile}
          savedPath={savedFront}
          required={!savedFront}
          uploadStatus={submitting ? frontStatus : undefined}
        />
        <FileUploadBox
          label="ID Back *"
          icon={FileText}
          file={backFile}
          onFileChange={setBackFile}
          savedPath={savedBack}
          required={!savedBack}
          uploadStatus={submitting ? backStatus : undefined}
        />
        <FileUploadBox
          label="Selfie *"
          icon={Camera}
          file={selfieFile}
          onFileChange={setSelfieFile}
          savedPath={savedSelfie}
          required={!savedSelfie}
          uploadStatus={submitting ? selfieStatus : undefined}
        />
      </div>

      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
        Upload clear photos of the ID document. Progress is saved automatically — you can resume if your connection drops.
      </p>

      {submitting && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>{uploadLabel}</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelUpload}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 w-full"
          >
            <XCircle className="w-4 h-4" /> Cancel Upload
          </Button>
        </div>
      )}

      {failedStep && !submitting && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-2">
          <p className="text-xs text-destructive font-medium">{failedStep}</p>
          <p className="text-xs text-muted-foreground">
            Your uploaded files have been saved. Only remaining uploads will be retried.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading…</>
          ) : failedStep ? (
            <><RefreshCw className="w-4 h-4 mr-2" />Retry</>
          ) : (
            'Submit KYC'
          )}
        </Button>
      </div>
    </form>
  );
}

const STATUS_CONFIG: Record<FileUploadStatus, { icon: React.ElementType; label: string; color: string } | null> = {
  idle: null,
  queued: { icon: Clock, label: 'Queued', color: 'text-muted-foreground' },
  uploading: { icon: Loader2, label: 'Uploading…', color: 'text-primary' },
  done: { icon: CheckCircle2, label: 'Done', color: 'text-primary' },
  failed: { icon: AlertCircle, label: 'Failed', color: 'text-destructive' },
};

function FileUploadBox({
  label,
  icon: Icon,
  file,
  onFileChange,
  savedPath,
  required,
  uploadStatus,
}: {
  label: string;
  icon: typeof Upload;
  file: File | null;
  onFileChange: (f: File | null) => void;
  savedPath?: string | null;
  required?: boolean;
  uploadStatus?: FileUploadStatus;
}) {
  const hasSaved = !!savedPath && !file;
  const statusCfg = uploadStatus ? STATUS_CONFIG[uploadStatus] : null;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        uploadStatus === 'failed'
          ? 'border-destructive/40 bg-destructive/5'
          : uploadStatus === 'uploading'
            ? 'border-primary/60 bg-primary/10'
            : hasSaved
              ? 'border-primary/40 bg-primary/5'
              : 'border-border hover:border-primary/40 hover:bg-primary/5'
      }`}>
        {file ? (
          <div className="text-center px-2">
            <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-foreground truncate max-w-full">{file.name}</p>
          </div>
        ) : hasSaved ? (
          <div className="text-center px-2">
            <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-primary font-medium">Uploaded</p>
            <p className="text-[10px] text-muted-foreground">Tap to replace</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Upload</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          required={required}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
      </label>
      {statusCfg && (
        <div className={`flex items-center gap-1 text-[11px] ${statusCfg.color}`}>
          <statusCfg.icon className={`w-3 h-3 ${uploadStatus === 'uploading' ? 'animate-spin' : ''}`} />
          <span>{statusCfg.label}</span>
        </div>
      )}
    </div>
  );
}