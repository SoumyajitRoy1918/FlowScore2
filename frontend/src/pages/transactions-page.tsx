import { CalendarRange, Database, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DailySpendingChart } from "@/components/daily-spending-chart";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppDatePicker } from "@/components/ui/date-picker";
import { useAppContext } from "@/context/app-context";
import type { AuthMessage, LoadTransactionsResult } from "@/types/app";

export default function TransactionsPage() {
  const { session, logout, refreshTransactions, gmailAuthenticated, authenticateGmail } = useAppContext();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [result, setResult] = useState<LoadTransactionsResult | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState<AuthMessage>({ type: "", text: "" });
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadMessage, setLoadMessage] = useState<AuthMessage>({ type: "", text: "" });

  async function handleLoad() {
    const userId = session?.linkedUserId || "demo_user_001";
    setLoadBusy(true);
    setLoadMessage({ type: "", text: "" });

    try {
      setResult(await refreshTransactions({ userId, startDate: filters.startDate, endDate: filters.endDate }));
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Unable to load transactions.";
      setLoadMessage({ type: "error", text: nextMessage });
      setResult(null);
    } finally {
      setLoadBusy(false);
    }
  }

  async function handleAuthenticateGmail() {
    setAuthBusy(true);
    setAuthMessage({ type: "", text: "" });

    try {
      const message = await authenticateGmail();
      setAuthMessage(message);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Gmail authentication failed.";
      setAuthMessage({ type: "error", text: nextMessage });
    } finally {
      setAuthBusy(false);
    }
  }

  const dateRange = result?.transactions.length
    ? `${[...result.transactions].map((transaction) => transaction.txnDate).sort().at(0) ?? "-"} to ${[...result.transactions].map((transaction) => transaction.txnDate).sort().at(-1) ?? "-"}`
    : "No rows loaded yet";

  return (
    <AppShell
      eyebrow="Transaction Review"
      title="Inspect financial activity before scoring"
      subtitle="Load transaction records from the backend JSON datasets, then review the core transaction details before moving into analysis."
      userName={session?.fullName || "Signed in"}
      onSignOut={logout}
    >
      <SectionCard
        title="User Transactions"
        description="Filter by user and optional date range, then inspect the normalized transaction feed backed by the JSON datasets."
        className="md:col-span-2"
      >
        <div className={`grid gap-4 ${gmailAuthenticated ? "md:grid-cols-[1fr_1fr_auto]" : "md:grid-cols-[1fr_1fr_auto_auto]"} md:items-end`}>
          <div className="space-y-2">
            <AppDatePicker
              label="Start date"
              value={filters.startDate}
              onChange={(nextValue) => setFilters((current) => ({ ...current, startDate: nextValue }))}
            />
          </div>
          <div className="space-y-2">
            <AppDatePicker
              label="End date"
              value={filters.endDate}
              onChange={(nextValue) => setFilters((current) => ({ ...current, endDate: nextValue }))}
            />
          </div>
          {!gmailAuthenticated ? (
            <Button onClick={handleAuthenticateGmail} disabled={authBusy} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
              {authBusy ? "Connecting..." : "Authenticate Gmail"}
            </Button>
          ) : null}
          <Button onClick={handleLoad} disabled={!gmailAuthenticated || loadBusy} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
            <Search className="size-4" />
            {loadBusy ? "Loading..." : "Load Transactions"}
          </Button>
        </div>

        {authMessage.text ? (
          <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${authMessage.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
            {authMessage.text}
          </div>
        ) : null}

        {loadMessage.text ? (
          <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${loadMessage.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
            {loadMessage.text}
          </div>
        ) : null}

        {result ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Database className="size-4" />
                  Transactions Loaded
                </div>
                <div className="mt-3 text-3xl font-bold text-white">{result.transactionCount}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <CalendarRange className="size-4" />
                  Visible Date Span
                </div>
                <div className="mt-3 text-sm font-medium text-slate-100">{dateRange}</div>
              </div>
            </div>

            <div className="mt-6">
              <DailySpendingChart transactions={result.transactions} />
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/65">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="bg-white/5 text-left text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Direction</th>
                      <th className="px-4 py-3 font-medium">Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-transparent">
                    {result.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-slate-300">{transaction.txnDate}</td>
                        <td className="px-4 py-3 font-medium text-white">{transaction.description}</td>
                        <td className="px-4 py-3 text-slate-200">{transaction.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant={transaction.direction === "income" ? "success" : "secondary"}>
                            {transaction.direction}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{transaction.transactionRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </SectionCard>
    </AppShell>
  );
}
