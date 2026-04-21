import { useState } from 'react';
import { Camera, Upload, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { kycService, ID_TYPE_LABELS, type IdDocumentType } from '@/services/kyc';

interface KycSubmitFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim() || idNumber.trim().length < 5) {
      toast.error('A valid ID number is required (at least 5 characters)');
      return;
    }
    if (!expiryDate) {
      toast.error('Expiry date is required');
      return;
    }
    if (!frontFile) {
      toast.error('Front of ID document is required');
      return;
    }
    if (!backFile) {
      toast.error('Back of ID document is required');
      return;
    }
    if (!selfieFile) {
      toast.error('A selfie photo is required');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setFailedStep(null);
    try {
      setUploadLabel('Uploading ID front…');
      setUploadProgress(10);
      const frontPath = await withRetry(() =>
        kycService.uploadDocument(userId, frontFile, 'front')
      ).catch((err) => { throw new Error(`ID front upload failed: ${err.message}`); });

      setUploadLabel('Uploading ID back…');
      setUploadProgress(35);
      const backPath = await withRetry(() =>
        kycService.uploadDocument(userId, backFile, 'back')
      ).catch((err) => { throw new Error(`ID back upload failed: ${err.message}`); });

      setUploadLabel('Uploading selfie…');
      setUploadProgress(60);
      const selfiePath = await withRetry(() =>
        kycService.uploadDocument(userId, selfieFile, 'selfie')
      ).catch((err) => { throw new Error(`Selfie upload failed: ${err.message}`); });

      setUploadLabel('Submitting KYC…');
      setUploadProgress(85);

      await withRetry(() =>
        kycService.submit({
          user_id: userId,
          id_type: idType,
          id_number: idNumber.trim(),
          id_front_url: frontPath,
          id_back_url: backPath,
          selfie_url: selfiePath,
          expiry_date: expiryDate,
        })
      ).catch((err) => { throw new Error(`KYC submission failed: ${err.message}`); });

      setUploadProgress(100);
      toast.success('KYC documents submitted for verification');
      onSuccess();
    } catch (error: any) {
      const msg = error.message || 'Failed to submit KYC';
      setFailedStep(msg);
      toast.error(msg, { description: 'Check your connection and try again.' });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
      setUploadLabel('');
    }
  };

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
          required
        />
        <FileUploadBox
          label="ID Back *"
          icon={FileText}
          file={backFile}
          onFileChange={setBackFile}
          required
        />
        <FileUploadBox
          label="Selfie *"
          icon={Camera}
          file={selfieFile}
          onFileChange={setSelfieFile}
          required
        />
      </div>

      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
        Upload clear photos of the ID document. A selfie helps verify the person matches the ID photo.
      </p>

      {submitting && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>{uploadLabel}</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {failedStep && !submitting && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-2">
          <p className="text-xs text-destructive font-medium">{failedStep}</p>
          <p className="text-xs text-muted-foreground">
            Each upload is retried automatically up to 2 times. If it still fails, check your internet connection and try again.
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

function FileUploadBox({
  label,
  icon: Icon,
  file,
  onFileChange,
  required,
}: {
  label: string;
  icon: typeof Upload;
  file: File | null;
  onFileChange: (f: File | null) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
        {file ? (
          <div className="text-center px-2">
            <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-foreground truncate max-w-full">{file.name}</p>
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
    </div>
  );
}
