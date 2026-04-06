import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'warning' | 'info' | 'secondary';
  delay?: number;
}

const variantClasses = {
  primary: 'stat-card-gradient',
  warning: 'stat-card-warning',
  info: 'stat-card-info',
  secondary: 'stat-card-secondary',
};

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${variantClasses[variant]} rounded-xl p-5 text-primary-foreground shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-heading font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-primary-foreground/15">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
