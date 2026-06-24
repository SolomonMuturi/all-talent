// components/dashboard/kpi-card.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type KpiCardProps = {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  description: string;
};

export function KpiCard({ title, value, change, icon, description }: KpiCardProps) {
  const isPositive = change ? change.startsWith('+') : true;
  
  return (
    <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {change && (
            <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          )}
          {change && ' '}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}