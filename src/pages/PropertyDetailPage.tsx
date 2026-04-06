import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Plus, Pencil, Trash2, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatUGX } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import AddUnitDialog from '@/components/forms/AddUnitDialog';
import EditUnitDialog from '@/components/forms/EditUnitDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;
type Unit = Tables<'units'>;

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    const [propRes, unitsRes] = await Promise.all([
      supabase.from('properties').select('*').eq('id', id).single(),
      supabase.from('units').select('*').eq('property_id', id).order('name'),
    ]);
    if (propRes.data) setProperty(propRes.data);
    if (unitsRes.data) setUnits(unitsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    if (!deleteUnit) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('units').delete().eq('id', deleteUnit.id);
      if (error) throw error;
      toast.success('Unit deleted');
      setDeleteUnit(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete unit');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Property not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/properties')}>Back to Properties</Button>
      </div>
    );
  }

  const occupied = units.filter(u => u.status === 'occupied').length;
  const vacant = units.filter(u => u.status === 'vacant').length;
  const reserved = units.filter(u => u.status === 'reserved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-0.5" onClick={() => navigate('/properties')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">{property.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" /> {property.location} · {property.type}
          </p>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-heading font-bold">{units.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Units</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-heading font-bold text-success">{occupied}</p>
          <p className="text-xs text-muted-foreground mt-1">Occupied</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-heading font-bold text-info">{vacant}</p>
          <p className="text-xs text-muted-foreground mt-1">Vacant</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-heading font-bold text-warning">{reserved}</p>
          <p className="text-xs text-muted-foreground mt-1">Reserved</p>
        </div>
      </motion.div>

      {/* Units */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" /> Units
          </h2>
          <AddUnitDialog propertyId={property.id} onSuccess={fetchData} />
        </div>

        {units.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <Home className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No units yet</p>
            <p className="text-sm mt-1">Add units to this property to start managing them</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 lg:hidden">
              {units.map((unit, i) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{unit.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{unit.type} · {formatUGX(unit.rent_amount)}/mo</p>
                    </div>
                    <StatusBadge status={unit.status} />
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditUnit(unit)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteUnit(unit)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Unit</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Rent</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{unit.name}</td>
                      <td className="px-4 py-3 text-sm capitalize">{unit.type}</td>
                      <td className="px-4 py-3 text-sm">{formatUGX(unit.rent_amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={unit.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditUnit(unit)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteUnit(unit)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      <EditUnitDialog unit={editUnit} open={!!editUnit} onOpenChange={(o) => !o && setEditUnit(null)} onSuccess={fetchData} />
      <DeleteConfirmDialog open={!!deleteUnit} onOpenChange={(o) => !o && setDeleteUnit(null)} onConfirm={handleDelete} loading={deleting} title="Delete Unit" description={`Are you sure you want to delete "${deleteUnit?.name}"? This cannot be undone.`} />
    </div>
  );
}
