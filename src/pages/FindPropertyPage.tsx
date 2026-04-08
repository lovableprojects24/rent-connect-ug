import { useState } from 'react';
import { Building2, MapPin, Search, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableListings, useApplyForUnit, useMyApplications } from '@/hooks/useRentalApplications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatUGX } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';

export default function FindPropertyPage() {
  const { user, profile } = useAuth();
  const { data: listings = [], isLoading } = useAvailableListings();
  const { data: myApps = [] } = useMyApplications();
  const applyMutation = useApplyForUnit();

  const [search, setSearch] = useState('');
  const [applyUnit, setApplyUnit] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');

  const filtered = listings.filter((u: any) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.properties?.name?.toLowerCase().includes(q) ||
      u.properties?.location?.toLowerCase().includes(q)
    );
  });

  const appliedUnitIds = new Set(
    myApps.filter((a: any) => a.status === 'pending').map((a: any) => a.unit_id)
  );

  const handleApply = async () => {
    if (!user || !applyUnit) return;
    if (!phone.trim()) return;
    await applyMutation.mutateAsync({
      applicant_user_id: user.id,
      property_id: applyUnit.property_id,
      unit_id: applyUnit.id,
      full_name: profile?.full_name || user.email || '',
      phone: phone.trim(),
      email: user.email,
      message: message.trim() || undefined,
    });
    setApplyUnit(null);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl mb-2">Find a Place</h1>
        <p className="text-muted-foreground">Browse available properties and apply for a unit</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by property name, location, or unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Available Units</h3>
          <p className="text-muted-foreground">Check back later for new listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((unit: any) => {
            const hasApplied = appliedUnitIds.has(unit.id);
            return (
              <div key={unit.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {unit.properties?.image_url ? (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={unit.properties.image_url}
                      alt={unit.properties?.name || 'Property'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-heading font-semibold text-lg leading-tight">{unit.name}</h3>
                      <p className="text-sm opacity-90 capitalize">{unit.type}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-44 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-primary-foreground/30" />
                    <div className="absolute bottom-3 left-4 right-4 text-primary-foreground">
                      <h3 className="font-heading font-semibold text-lg leading-tight">{unit.name}</h3>
                      <p className="text-sm opacity-90 capitalize">{unit.type}</p>
                    </div>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium text-foreground">{unit.properties?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{unit.properties?.location}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xl font-heading font-bold text-primary">
                      {formatUGX(unit.rent_amount)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  </div>
                  {hasApplied ? (
                    <Button variant="outline" disabled className="w-full gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Applied
                    </Button>
                  ) : (
                    <Button className="w-full gap-2" onClick={() => { setApplyUnit(unit); setPhone(profile?.phone || ''); }}>
                      <Send className="w-4 h-4" />
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Dialog */}
      <Dialog open={!!applyUnit} onOpenChange={(o) => !o && setApplyUnit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Apply for {applyUnit?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {applyUnit?.properties?.name} — {applyUnit?.properties?.location}
            </p>
            <p className="font-semibold text-primary text-lg">{formatUGX(applyUnit?.rent_amount || 0)}/mo</p>
          </div>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Your Phone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0771234567" />
            </div>
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the manager why you're interested..." rows={3} />
            </div>
            <Button className="w-full" onClick={handleApply} disabled={applyMutation.isPending || !phone.trim()}>
              {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
