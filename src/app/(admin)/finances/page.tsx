'use client';

import { useState, useEffect } from 'react';
import { TransactionsTable } from "@/components/finances/transactions-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function FinancesPage() {
  const [totals, setTotals] = useState({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    total_transactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceSummary();
  }, []);

  const fetchFinanceSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finances/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch finance summary');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTotals(data.data.totals);
      } else {
        setError(data.error || 'Failed to load finance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  };

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
          value={`KES ${totals.total_revenue?.toLocaleString() || '0'}`}
          icon={<TrendingUp className="size-5 text-muted-foreground" />}
          description="All incoming funds"
        />
        <KpiCard
          title="Total Expenses"
          value={`KES ${totals.total_expenses?.toLocaleString() || '0'}`}
          icon={<TrendingDown className="size-5 text-muted-foreground" />}
          description="All outgoing funds"
        />
        <KpiCard
          title="Net Profit"
          value={`KES ${totals.net_profit?.toLocaleString() || '0'}`}
          icon={<DollarSign className="size-5 text-muted-foreground" />}
          description="Revenue minus expenses"
        />
      </div>

      <TransactionsTable />
    </div>
  );
}
