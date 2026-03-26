import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "@/types/app";

interface DailySpendingChartProps {
  transactions: Transaction[];
}

interface DayPoint {
  day: number;
  income: number;
  expense: number;
}

interface HoveredPoint extends DayPoint {
  x: number;
  incomeY: number;
  expenseY: number;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMonthLabel(monthKey: string) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    return monthKey;
  }

  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return monthKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] || next;

    const controlPoint1X = current.x + (next.x - previous.x) / 6;
    const controlPoint1Y = current.y + (next.y - previous.y) / 6;
    const controlPoint2X = next.x - (afterNext.x - current.x) / 6;
    const controlPoint2Y = next.y - (afterNext.y - current.y) / 6;

    path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`;
  }

  return path;
}

function getAvailableMonths(transactions: Transaction[]) {
  return [
    ...new Set(
      transactions
        .map((transaction) => transaction.txnDate)
        .filter(isIsoDate)
        .map((txnDate) => txnDate.slice(0, 7))
    ),
  ].sort();
}

function buildMonthSeries(transactions: Transaction[], monthKey: string) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    return null;
  }

  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const totals = new Map<number, { income: number; expense: number }>();

  for (const transaction of transactions) {
    if (!isIsoDate(transaction.txnDate) || !transaction.txnDate.startsWith(monthKey)) {
      continue;
    }

    const day = Number(transaction.txnDate.slice(8, 10));
    const existing = totals.get(day) || { income: 0, expense: 0 };

    if (transaction.direction === "income") {
      existing.income += transaction.amount;
    } else {
      existing.expense += transaction.amount;
    }

    totals.set(day, existing);
  }

  const points: DayPoint[] = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const total = totals.get(day) || { income: 0, expense: 0 };
    return {
      day,
      income: total.income,
      expense: total.expense,
    };
  });

  const maxAmount = Math.max(
    ...points.map((point) => Math.max(point.income, point.expense)),
    0
  );

  return {
    monthLabel: formatMonthLabel(monthKey),
    daysInMonth,
    points,
    maxAmount,
    totalIncome: points.reduce((sum, point) => sum + point.income, 0),
    totalExpense: points.reduce((sum, point) => sum + point.expense, 0),
  };
}

export function DailySpendingChart({ transactions }: DailySpendingChartProps) {
  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths.at(-1) || "");
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  useEffect(() => {
    if (!availableMonths.length) {
      setSelectedMonth("");
      return;
    }

    if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths.at(-1) || "");
    }
  }, [availableMonths, selectedMonth]);

  const chart = useMemo(() => {
    if (!selectedMonth) {
      return null;
    }
    return buildMonthSeries(transactions, selectedMonth);
  }, [selectedMonth, transactions]);

  if (!chart || !availableMonths.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-400">
        No transaction data is available to plot yet.
      </div>
    );
  }

  const chartHeight = 290;
  const topPadding = 22;
  const bottomPadding = 42;
  const plotHeight = chartHeight - topPadding - bottomPadding;
  const yAxisWidth = 76;
  const rightPadding = 18;
  const xStep = 28;
  const chartWidth = yAxisWidth + rightPadding + Math.max(chart.daysInMonth - 1, 0) * xStep + 28;
  const tickValues = chart.maxAmount
    ? [chart.maxAmount, chart.maxAmount * 0.75, chart.maxAmount * 0.5, chart.maxAmount * 0.25, 0]
    : [0];

  const coordinates = chart.points.map((point, index) => {
    const x = yAxisWidth + 14 + index * xStep;
    const incomeY = topPadding + plotHeight - (chart.maxAmount ? (point.income / chart.maxAmount) * plotHeight : 0);
    const expenseY = topPadding + plotHeight - (chart.maxAmount ? (point.expense / chart.maxAmount) * plotHeight : 0);

    return {
      ...point,
      x,
      incomeY,
      expenseY,
    };
  });

  const incomePath = buildSmoothPath(coordinates.map((point) => ({ x: point.x, y: point.incomeY })));
  const expensePath = buildSmoothPath(coordinates.map((point) => ({ x: point.x, y: point.expenseY })));

  const tooltipWidth = 152;
  const tooltipHeight = 68;
  const tooltipX = hoveredPoint
    ? Math.min(Math.max(hoveredPoint.x - tooltipWidth / 2, yAxisWidth + 8), chartWidth - tooltipWidth - 8)
    : 0;
  const tooltipY = hoveredPoint
    ? Math.max(8, Math.min(hoveredPoint.expenseY, hoveredPoint.incomeY) - tooltipHeight - 16)
    : 0;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Daily Cash Flow</p>
            <h3 className="mt-2 font-[Manrope] text-2xl font-bold text-white">{chart.monthLabel}</h3>
            <p className="mt-2 text-sm text-slate-300">
              Day-by-day totals for the selected month. Hover any point to inspect both income and spending.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Income</div>
              <div className="mt-2 text-2xl font-bold text-emerald-300">INR {formatCurrency(chart.totalIncome)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Expense</div>
              <div className="mt-2 text-2xl font-bold text-white">INR {formatCurrency(chart.totalExpense)}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {availableMonths.map((month) => {
              const isActive = month === selectedMonth;
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(month);
                    setHoveredPoint(null);
                  }}
                  className={isActive
                    ? "rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-slate-950"
                    : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  }
                >
                  {formatMonthLabel(month)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              Income
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              Expense
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="min-w-[760px]"
          style={{ width: `${Math.max(760, chartWidth)}px`, height: `${chartHeight}px` }}
          role="img"
          aria-label={`Daily income and expense chart for ${chart.monthLabel}`}
        >
          {tickValues.map((tickValue, index) => {
            const y =
              topPadding +
              (chart.maxAmount
                ? plotHeight - (tickValue / chart.maxAmount) * plotHeight
                : plotHeight);

            return (
              <g key={`${tickValue}-${index}`}>
                <line
                  x1={yAxisWidth}
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 6"
                />
                <text
                  x={yAxisWidth - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(203,213,225,0.82)"
                  fontSize="11"
                >
                  INR {formatCurrency(tickValue)}
                </text>
              </g>
            );
          })}

          <path d={incomePath} fill="none" stroke="rgba(16,185,129,0.18)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={expensePath} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={incomePath} fill="none" stroke="rgba(110,231,183,0.98)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={expensePath} fill="none" stroke="rgba(255,255,255,0.96)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {hoveredPoint ? (
            <line
              x1={hoveredPoint.x}
              x2={hoveredPoint.x}
              y1={topPadding}
              y2={topPadding + plotHeight}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 6"
            />
          ) : null}

          {coordinates.map((point) => {
            const isHovered = hoveredPoint?.day === point.day;

            return (
              <g key={point.day}>
                <rect
                  x={point.x - xStep / 2}
                  y={topPadding}
                  width={xStep}
                  height={plotHeight + bottomPadding}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseMove={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={point.x}
                  cy={point.incomeY}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "rgba(110,231,183,1)" : "rgba(110,231,183,0.9)"}
                  stroke="rgba(2,6,23,0.95)"
                  strokeWidth="2"
                />
                <circle
                  cx={point.x}
                  cy={point.expenseY}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.92)"}
                  stroke="rgba(2,6,23,0.95)"
                  strokeWidth="2"
                />
                <text
                  x={point.x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fill="rgba(203,213,225,0.82)"
                  fontSize="10"
                >
                  {point.day}
                </text>
              </g>
            );
          })}

          {hoveredPoint ? (
            <g pointerEvents="none">
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="12"
                fill="rgba(2,6,23,0.94)"
                stroke="rgba(255,255,255,0.14)"
              />
              <text x={tooltipX + 12} y={tooltipY + 18} fill="rgba(148,163,184,0.92)" fontSize="11" fontWeight="600">
                Day {hoveredPoint.day}
              </text>
              <text x={tooltipX + 12} y={tooltipY + 36} fill="rgba(110,231,183,0.98)" fontSize="12" fontWeight="700">
                Income: INR {formatCurrency(hoveredPoint.income)}
              </text>
              <text x={tooltipX + 12} y={tooltipY + 54} fill="rgba(255,255,255,0.96)" fontSize="12" fontWeight="700">
                Expense: INR {formatCurrency(hoveredPoint.expense)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
