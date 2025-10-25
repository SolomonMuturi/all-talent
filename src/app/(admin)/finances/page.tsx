import { TransactionsTable } from "@/components/finances/transactions-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { transactions } from "@/lib/data";

export default function FinancesPage() {
  const totalRevenue = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Financial Automation</h1>
        <p className="text-muted-foreground">
          View and manage all academy financial transactions.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="size-5 text-muted-foreground" />}
          description="All incoming funds"
        />
        <KpiCard
          title="Total Expenses"
          value={`KES ${totalExpenses.toLocaleString()}`}
          icon={<TrendingDown className="size-5 text-muted-foreground" />}
          description="All outgoing funds"
        />
        <KpiCard
          title="Net Profit"
          value={`KES ${netProfit.toLocaleString()}`}
          icon={<DollarSign className="size-5 text-muted-foreground" />}
          description="Revenue minus expenses"
        />
      </div>

      <TransactionsTable />
    </div>
  );
}
