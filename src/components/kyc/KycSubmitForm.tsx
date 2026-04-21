import { useState } from 'react';
import { Camera, Upload, FileText, Loader2 } from 'lucide-react';
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
    try {
      setUploadLabel('Uploading ID front…');
      setUploadProgress(10);
      const frontPath = await kycService.uploadDocument(userId, frontFile, 'front');

      setUploadLabel('Uploading ID back…');
      setUploadProgress(35);
      const backPath = await kycService.uploadDocument(userId, backFile, 'back');

      setUploadLabel('Uploading selfie…');
      setUploadProgress(60);
      const selfiePath = await kycService.uploadDocument(userId, selfieFile, 'selfie');

      setUploadLabel('Submitting KYC…');
      setUploadProgress(85);

      await kycService.submit({
        user_id: userId,
        id_type: idType,
        id_number: idNumber.trim(),
        id_front_url: frontPath,
        id_back_url: backPath,
        selfie_url: selfiePath,
        expiry_date: expiryDate,
      });

      setUploadProgress(100);
      toast.success('KYC documents submitted for verification');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC');
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

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading…</>
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
