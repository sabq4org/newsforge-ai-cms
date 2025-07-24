import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconType } from '@phosphor-icons/react';

interface UserAnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function UserAnalyticsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  trend 
}: UserAnalyticsCardProps) {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-200'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      border: 'border-gray-200'
    }
  };

  const variant = colorVariants[color];

  return (
    <Card className={`${variant.border} transition-all hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {value}
              </p>
              {trend && (
                <Badge 
                  variant={trend.isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${variant.bg}`}>
            <Icon className={`w-6 h-6 ${variant.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}