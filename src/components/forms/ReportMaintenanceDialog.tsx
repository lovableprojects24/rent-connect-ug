import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Priority = Database['public']['Enums']['maintenance_priority'];

interface ReportMaintenanceDialogProps {
  propertyId: string;
  unitId: string;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export default function ReportMaintenanceDialog({ propertyId, unitId, onSuccess, trigger }: ReportMaintenanceDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim() || !user) return;

    setSubmitting(true);

    // Get tenant record for this user
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { error } = await supabase.from('maintenance_requests').insert({
      issue: issue.trim(),
      description: description.trim() || null,
      priority,
      property_id: propertyId,
      unit_id: unitId,
      submitted_by: user.id,
      tenant_id: tenantData?.id || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit request');
      console.error(error);
      return;
    }

    toast.success('Maintenance request submitted');
    setIssue('');
    setDescription('');
    setPriority('medium');
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Report Maintenance Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue">Issue *</Label>
            <Input
              id="issue"
              placeholder="e.g. Leaking tap in kitchen"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !issue.trim()}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
