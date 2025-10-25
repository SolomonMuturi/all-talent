import { TransactionsTable } from "@/components/finances/transactions-table";

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Financial Automation</h1>
        <p className="text-muted-foreground">
          View and manage all academy financial transactions.
        </p>
      </div>
      <TransactionsTable />
    </div>
  );
}
