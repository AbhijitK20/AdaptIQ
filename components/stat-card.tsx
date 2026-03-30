import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  isLoading?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', isLoading = false }: StatCardProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-[#22C55E]/10 text-[#22C55E]',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    destructive: 'bg-[#EF4444]/10 text-[#EF4444]',
  };

  if (isLoading) {
    return (
      <Card className="pixel-panel overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 w-full">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-16 rounded" />
                {subtitle && (
                  <Skeleton className="h-4 w-20 rounded" />
                )}
              </div>
              {trend && (
                <Skeleton className="h-4 w-24 rounded" />
              )}
            </div>
            <div className={cn('rounded-lg p-3', variantStyles[variant])}>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pixel-panel overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{value}</span>
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
            {trend && (
              <p className={cn(
                'text-xs font-medium',
                trend.value >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn('rounded-lg p-3', variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
