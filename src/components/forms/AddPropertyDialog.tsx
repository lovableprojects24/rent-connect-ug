import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const PROPERTY_TYPES = ['Apartments', 'Rental Houses', 'Commercial', 'Hostel', 'Mixed Use'];

interface AddPropertyDialogProps {
  onSuccess: () => void;
}

export default function AddPropertyDialog({ onSuccess }: AddPropertyDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Apartments');
  const [totalUnits, setTotalUnits] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setLocation('');
    setType('Apartments');
    setTotalUnits('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const units = parseInt(totalUnits, 10);

    if (!trimmedName || trimmedName.length > 100) {
      toast.error('Property name is required (max 100 characters)');
      return;
    }
    if (!trimmedLocation || trimmedLocation.length > 200) {
      toast.error('Location is required (max 200 characters)');
      return;
    }
    if (isNaN(units) || units < 1 || units > 9999) {
      toast.error('Total units must be between 1 and 9999');
      return;
    }

    setSubmitting(true);
    try {
      let image_url: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('property-images').upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const { error } = await supabase.from('properties').insert({
        name: trimmedName,
        location: trimmedLocation,
        type,
        total_units: units,
        owner_id: user.id,
        image_url,
      });
      if (error) throw error;
      toast.success('Property added successfully!');
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Property</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="prop-name">Property Name *</Label>
            <Input id="prop-name" placeholder="e.g. Sunset Apartments" value={name} onChange={e => setName(e.target.value)} maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prop-location">Location *</Label>
            <Input id="prop-location" placeholder="e.g. Ntinda, Kampala" value={location} onChange={e => setLocation(e.target.value)} maxLength={200} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-units">Total Units *</Label>
              <Input id="prop-units" type="number" min={1} max={9999} placeholder="e.g. 12" value={totalUnits} onChange={e => setTotalUnits(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Property Image</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden h-32">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" /> Upload Image
              </Button>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Property'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
