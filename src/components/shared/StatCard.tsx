import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
  iconBgColor?: string;
  iconColor?: string;
  variant?: 'primary' | 'info' | 'secondary' | 'warning';
  delay?: number;
}

const variantStyles = {
  primary: { bg: 'bg-blue-100', text: 'text-blue-600' },
  info: { bg: 'bg-purple-100', text: 'text-purple-600' },
  secondary: { bg: 'bg-green-100', text: 'text-green-600' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  iconBgColor,
  iconColor,
  variant = 'primary',
}: StatCardProps) {
  const styles = variantStyles[variant];
  const bgClass = iconBgColor || styles.bg;
  const textClass = iconColor || styles.text;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-2">{title}</p>
          <h3 className="text-2xl font-heading font-semibold mb-1">{value}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`${bgClass} ${textClass} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
