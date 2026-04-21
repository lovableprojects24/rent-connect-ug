import { useState } from 'react';
import { Camera, Upload, FileText } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      toast.error('ID number is required');
      return;
    }
    if (!frontFile) {
      toast.error('Front of ID document is required');
      return;
    }

    setSubmitting(true);
    try {
      const frontPath = await kycService.uploadDocument(userId, frontFile, 'front');
      let backPath: string | undefined;
      let selfiePath: string | undefined;

      if (backFile) backPath = await kycService.uploadDocument(userId, backFile, 'back');
      if (selfieFile) selfiePath = await kycService.uploadDocument(userId, selfieFile, 'selfie');

      await kycService.submit({
        user_id: userId,
        id_type: idType,
        id_number: idNumber.trim(),
        id_front_url: frontPath,
        id_back_url: backPath,
        selfie_url: selfiePath,
        expiry_date: expiryDate || undefined,
      });

      toast.success('KYC documents submitted for verification');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
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
        <Label>Expiry Date (optional)</Label>
        <Input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
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
          label="ID Back"
          icon={FileText}
          file={backFile}
          onFileChange={setBackFile}
        />
        <FileUploadBox
          label="Selfie"
          icon={Camera}
          file={selfieFile}
          onFileChange={setSelfieFile}
        />
      </div>

      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
        Upload clear photos of the ID document. A selfie helps verify the person matches the ID photo.
      </p>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Uploading…' : 'Submit KYC'}
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
