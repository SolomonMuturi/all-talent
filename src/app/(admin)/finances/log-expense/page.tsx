import { ExpenseForm } from "@/components/finances/expense-form";

export default function LogExpensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Log an Expense</h1>
        <p className="text-muted-foreground">
          Record a new expense for the academy.
        </p>
      </div>
      <ExpenseForm />
    </div>
  );
}
