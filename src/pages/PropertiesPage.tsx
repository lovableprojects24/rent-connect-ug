import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import AddPropertyDialog from '@/components/forms/AddPropertyDialog';
import EditPropertyDialog from '@/components/forms/EditPropertyDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useProperties, useDeleteProperty } from '@/hooks/useProperties';
import { useUnits } from '@/hooks/useUnits';
import type { Tables } from '@/integrations/supabase/types';
import { formatUGX } from '@/lib/utils';

type Property = Tables<'properties'>;

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { data: properties = [], isLoading: loading } = useProperties();
  const { data: units = [] } = useUnits();
  const deletePropertyMutation = useDeleteProperty();
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);
  const [search, setSearch] = useState('');

  const handleDelete = async () => {
    if (!deleteProperty) return;
    await deletePropertyMutation.mutateAsync(deleteProperty.id);
    setDeleteProperty(null);
  };

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Properties</h1>
          <p className="text-muted-foreground">Manage and monitor your properties</p>
        </div>
        <AddPropertyDialog onSuccess={() => {}} />
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Properties Found</h3>
          <p className="text-muted-foreground mb-6">Get started by adding your first property</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((property) => {
            const propUnits = units.filter(u => u.property_id === property.id);
            const occupied = propUnits.filter(u => u.status === 'occupied').length;
            const vacant = propUnits.filter(u => u.status === 'vacant').length;
            const occupancyRate = propUnits.length > 0 ? Math.round((occupied / propUnits.length) * 100) : 0;

            return (
              <div key={property.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-heading font-semibold text-lg mb-2 cursor-pointer hover:opacity-80" onClick={() => navigate(`/properties/${property.id}`)}>
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-100">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                    </div>
                    <Building2 className="w-8 h-8 text-white/60" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-heading font-semibold mb-1">{propUnits.length}</p>
                      <p className="text-xs text-muted-foreground">Total Rooms</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-heading font-semibold text-green-700 mb-1">{occupied}</p>
                      <p className="text-xs text-green-700">Occupied</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-heading font-semibold text-orange-700 mb-1">{vacant}</p>
                      <p className="text-xs text-orange-700">Vacant</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span>{property.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy Rate</span>
                      <span className="font-medium">{occupancyRate}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setEditProperty(property)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteProperty(property)}
                      className="px-3 py-2 border border-border rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditPropertyDialog property={editProperty} open={!!editProperty} onOpenChange={(o) => !o && setEditProperty(null)} onSuccess={() => {}} />
      <DeleteConfirmDialog open={!!deleteProperty} onOpenChange={(o) => !o && setDeleteProperty(null)} onConfirm={handleDelete} loading={deletePropertyMutation.isPending} title="Delete Property" description={`Are you sure you want to delete "${deleteProperty?.name}"? This cannot be undone.`} />
    </div>
  );
}
