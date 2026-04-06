import { useEffect, useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatUGX } from '@/data/mock-data';
import { motion } from 'framer-motion';
import AddPropertyDialog from '@/components/forms/AddPropertyDialog';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (data) setProperties(data);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">{properties.length} properties in your portfolio</p>
        </div>
        <AddPropertyDialog onSuccess={fetchProperties} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No properties yet</p>
          <p className="text-sm mt-1">Add your first property to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="h-32 stat-card-gradient flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary-foreground/40" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-heading font-semibold">{property.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {property.location}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{property.type}</span>
                  <span className="font-medium">{property.total_units} units</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
