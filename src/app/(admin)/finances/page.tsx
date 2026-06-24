// app/(admin)/finances/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TransactionsTable } from "@/components/finances/transactions-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, FileText, Download, Filter } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FinancesPage() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    total_transactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions
      const transactionsResponse = await fetch('/api/finances/transactions');
      const transactionsData = await transactionsResponse.json();
      
      if (transactionsData.success) {
        setTransactions(transactionsData.data?.transactions || []);
      }

      // Fetch summary
      const summaryResponse = await fetch('/api/finances/summary');
      const summaryData = await summaryResponse.json();
      
      if (summaryData.success) {
        setTotals(summaryData.data.totals);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Export functionality
    alert('Export report functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading finances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button onClick={fetchFinanceData} className="px-4 py-2 bg-primary text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Financial Automation</h1>
          <p className="text-muted-foreground">
            View and manage all academy financial transactions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Make Payment Button */}
          <Button asChild variant="default">
            <Link href="/finances/pay">
              <Plus className="mr-2 h-4 w-4" />
              Make Payment
            </Link>
          </Button>

          {/* Log Expense Button */}
          <Button asChild variant="outline">
            <Link href="/finances/log-expense">
              <FileText className="mr-2 h-4 w-4" />
              Log Expense
            </Link>
          </Button>

          {/* Export Report Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportReport}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportReport}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportReport}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Transactions Table */}
      <TransactionsTable data={transactions} />
    </div>
  );
}