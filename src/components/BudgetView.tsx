import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import '../utils/chartSetup';
import { Budget, Currency, Transaction } from '../types/finance';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { ChartOptions } from 'chart.js';
import {
  Target,
  PlusCircle,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

interface BudgetViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: Currency;
  onOpenBudgetModal: () => void;
  onDeleteBudget: (id: string) => void;
  onOpenAddExpenseModal: () => void;
  hideBalance: boolean;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  transactions,
  currency,
  onOpenBudgetModal,
  onDeleteBudget,
  onOpenAddExpenseModal,
  hideBalance,
}) => {
  const currentMonth = '2026-09';

  const categorySpending = useMemo(() => {
    const spendingMap: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.isCompleted && tx.date.startsWith(currentMonth)) {
        spendingMap[tx.category] = (spendingMap[tx.category] || 0) + tx.amount;
      }
    });
    return spendingMap;
  }, [transactions]);

  const currentMonthIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income' && tx.isCompleted && tx.date.startsWith(currentMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + (categorySpending[b.category] || 0), 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const totalSpentPercentage = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  const alerts = useMemo(() => {
    const list: {
      budget: Budget;
      spent: number;
      pct: number;
      isExceeded: boolean;
      isNearLimit: boolean;
    }[] = [];

    budgets.forEach((b) => {
      const spent = categorySpending[b.category] || 0;
      const pct = (spent / b.limit) * 100;
      const isExceeded = pct >= 100;
      const isNearLimit = pct >= b.alertThreshold && !isExceeded;

      if (isExceeded || isNearLimit) {
        list.push({ budget: b, spent, pct, isExceeded, isNearLimit });
      }
    });

    return list;
  }, [budgets, categorySpending]);

  const chartData = useMemo(() => {
    const labels = budgets.map((b) => b.category);
    const limits = budgets.map((b) => b.limit);
    const spents = budgets.map((b) => categorySpending[b.category] || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Установленный лимит',
          data: limits,
          backgroundColor: 'rgba(51, 65, 85, 0.7)',
          borderColor: '#475569',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6,
        },
        {
          label: 'Фактически израсходовано',
          data: spents,
          backgroundColor: spents.map((s, idx) => {
            const lim = limits[idx];
            if (s > lim) return '#EF4444';
            if (s >= lim * 0.8) return '#F59E0B';
            return '#10B981';
          }),
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    };
  }, [budgets, categorySpending]);

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#94A3B8',
          font: { size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(51, 65, 85, 0.7)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        padding: 10,
        callbacks: {
          label: (context) => {
            const val = context.raw as number;
            return ` ${context.dataset.label}: ${formatCurrency(val, currency, hideBalance)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: {
          color: '#94A3B8',
          font: { size: 11, family: "'JetBrains Mono', monospace" },
          callback: (value) => formatCurrency(Number(value), currency, hideBalance),
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#E2E8F0', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Ambient Glow */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 overflow-hidden shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Бюджетирование и лимиты расходов</h2>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                Сентябрь 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Устанавливайте лимиты по категориям, контролируйте перерасход и управляйте своими финансами.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAddExpenseModal}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors border border-slate-700/60"
            >
              − Записать расход
            </button>
            <button
              onClick={onOpenBudgetModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20 active:translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Создать бюджет</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 z-10 relative">
          <div>
            <p className="text-xs text-slate-400">Совокупный лимит</p>
            <p className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              {formatCurrency(totalBudgetLimit, currency, hideBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">на {budgets.length} категорий</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Фактически потрачено</p>
            <p className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-0.5">
              {formatCurrency(totalBudgetSpent, currency, hideBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {totalSpentPercentage.toFixed(1)}% от лимита
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Остаток бюджета</p>
            <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
              {formatCurrency(remainingBudget, currency, hideBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">доступно до конца месяца</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Доля от дохода месяца</p>
            <p className="text-xl font-bold text-cyan-400 font-mono tabular-nums mt-0.5">
              {currentMonthIncome > 0
                ? `${((totalBudgetSpent / currentMonthIncome) * 100).toFixed(0)}%`
                : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              при доходе {formatCurrency(currentMonthIncome, currency, hideBalance)}
            </p>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map(({ budget, spent, pct, isExceeded }) => (
            <div
              key={budget.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                isExceeded
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${isExceeded ? 'text-rose-400' : 'text-amber-400'}`}
                />
                <div>
                  <span className="font-semibold">{budget.category}: </span>
                  {isExceeded ? (
                    <span>
                      Превышен лимит! Израсходовано{' '}
                      <strong className="font-mono">{formatCurrency(spent, currency, hideBalance)}</strong> из{' '}
                      <strong className="font-mono">{formatCurrency(budget.limit, currency, hideBalance)}</strong> ({pct.toFixed(0)}%).
                    </span>
                  ) : (
                    <span>
                      Внимание: использовано{' '}
                      <strong className="font-mono">{pct.toFixed(0)}%</strong> от лимита (порог {budget.alertThreshold}%).
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] opacity-80 shrink-0 font-medium">
                {isExceeded ? '🚨 Превышение' : '⚠️ Внимание'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart: Budget vs Actual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[340px] shadow-xl shadow-slate-950/20">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-white">Сравнение: Лимит бюджета vs Реальные расходы</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Наглядная визуализация расходования средств по каждой категории
          </p>
        </div>
        <div className="flex-1 w-full min-h-0 relative">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Individual Budget Cards with Radial Ring Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const spent = categorySpending[b.category] || 0;
          const pct = Math.round((spent / b.limit) * 100);
          const isExceeded = pct >= 100;
          const isNear = pct >= b.alertThreshold && !isExceeded;
          const balance = b.limit - spent;
          const color = getCategoryColor(b.category);

          // SVG radial ring calculations (radius 32, circumference ~ 201)
          const radius = 32;
          const circ = 2 * Math.PI * radius;
          const strokeDashoffset = circ - (Math.min(100, pct) / 100) * circ;

          return (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-xl shadow-slate-950/20"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Radial Ring Mini Badge */}
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-slate-800"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke={isExceeded ? '#EF4444' : isNear ? '#F59E0B' : color}
                          strokeWidth="5"
                          strokeDasharray={circ}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold font-mono text-white">
                          {pct}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">{b.category}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Лимит: {formatCurrency(b.limit, currency, hideBalance)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    title="Удалить бюджет"
                    aria-label="Удалить бюджет"
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {b.notes && <p className="text-xs text-slate-400 mt-3">{b.notes}</p>}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {balance >= 0 ? 'Остаток:' : 'Перерасход:'}
                </span>
                <span
                  className={`font-mono tabular-nums font-semibold ${
                    balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(Math.abs(balance), currency, hideBalance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
