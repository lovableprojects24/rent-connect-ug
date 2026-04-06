import { Building2, MapPin, Plus } from 'lucide-react';
import { properties, formatUGX } from '@/data/mock-data';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">{properties.length} properties in your portfolio</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Property</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((property, i) => {
          const occupancyRate = Math.round((property.occupiedUnits / property.totalUnits) * 100);
          return (
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
                  <span className="font-medium">{formatUGX(property.monthlyRevenue)}/mo</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {property.occupiedUnits}/{property.totalUnits} units occupied
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
