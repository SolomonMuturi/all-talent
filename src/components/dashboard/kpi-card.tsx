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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className="text-xs text-muted-foreground">
          {change && <span className={isPositive ? 'text-green-600' : 'text-red-600'}>{change}</span>}
          {' '}{description}
        </p>
      </CardContent>
    </Card>
  );
}
