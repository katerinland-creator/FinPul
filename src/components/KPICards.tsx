import React from 'react';
import { Currency, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, Clock, Wallet, Target } from 'lucide-react';

interface KPICardsProps {
  transactions: Transaction[];
  currency: Currency;
  onOpenExecutionTab: () => void;
  hideBalance: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({
  transactions,
  currency,
  onOpenExecutionTab,
  hideBalance,
}) => {
  // Realized income
  const realizedIncomes = transactions.filter((t) => t.type === 'income' && t.isCompleted);
  const totalRealizedIncome = realizedIncomes.reduce((acc, t) => acc + t.amount, 0);

  // Planned/Pending incomes
  const pendingIncomes = transactions.filter((t) => t.type === 'income' && !t.isCompleted);
  const totalPendingIncome = pendingIncomes.reduce((acc, t) => acc + t.amount, 0);

  // Realized expenses
  const realizedExpenses = transactions.filter((t) => t.type === 'expense' && t.isCompleted);
  const totalRealizedExpenses = realizedExpenses.reduce((acc, t) => acc + t.amount, 0);

  // Net Cashflow
  const netBalance = totalRealizedIncome - totalRealizedExpenses;

  // Completion rate of expected income
  const totalPotentialIncome = totalRealizedIncome + totalPendingIncome;
  const completionRate = totalPotentialIncome > 0 ? (totalRealizedIncome / totalPotentialIncome) * 100 : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Realized Income */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all overflow-hidden group shadow-lg shadow-slate-950/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-xs font-medium text-slate-400">Фактический доход</p>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1 font-mono tabular-nums">
              {formatCurrency(totalRealizedIncome, currency, hideBalance)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Sparkline mini-trend preview */}
        <div className="my-3 z-10">
          <svg className="w-full h-8 text-emerald-500/40" viewBox="0 0 120 30" fill="none">
            <path
              d="M0 25 Q 20 18, 40 20 T 80 10 T 120 5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M0 25 Q 20 18, 40 20 T 80 10 T 120 5 L 120 30 L 0 30 Z"
              fill="url(#emerald-glow)"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="emerald-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-1 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 z-10">
          <span className="text-emerald-400 font-mono tabular-nums">{realizedIncomes.length} транзакций</span>
          <span aria-hidden="true">·</span>
          <span>зачислено на счета</span>
        </div>
      </div>

      {/* 2. Pending / Scheduled Income (Execution Queue) */}
      <div
        onClick={onOpenExecutionTab}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 cursor-pointer transition-all overflow-hidden group shadow-lg shadow-slate-950/30"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

        <div className="flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors">
                Ожидает поступления
              </p>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-amber-300 mt-1 font-mono tabular-nums">
              {formatCurrency(totalPendingIncome, currency, hideBalance)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Sparkline mini-trend preview */}
        <div className="my-3 z-10">
          <svg className="w-full h-8 text-amber-500/40" viewBox="0 0 120 30" fill="none">
            <path
              d="M0 20 Q 30 15, 60 22 T 120 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="mt-1 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 z-10">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono tabular-nums">{pendingIncomes.length} задач</span>
            <span aria-hidden="true">·</span>
            <span>к выполнению</span>
          </div>
          <span className="text-amber-400/90 group-hover:text-amber-300 text-[11px] font-medium">Открыть →</span>
        </div>
      </div>

      {/* 3. Net Savings / Cashflow */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all overflow-hidden group shadow-lg shadow-slate-950/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-xs font-medium text-slate-400">Чистый остаток (Сальдо)</p>
            <h3 className={`text-2xl font-bold tracking-tight mt-1 font-mono tabular-nums ${netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(netBalance, currency, hideBalance)}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Sparkline mini-trend preview */}
        <div className="my-3 z-10">
          <svg className="w-full h-8 text-cyan-500/40" viewBox="0 0 120 30" fill="none">
            <path
              d="M0 15 Q 30 25, 60 12 T 120 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="mt-1 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 z-10">
          <span>Расходы:</span>
          <span className="text-slate-300 font-mono tabular-nums">{formatCurrency(totalRealizedExpenses, currency, hideBalance)}</span>
          <span aria-hidden="true">·</span>
          <span>{((netBalance / (totalRealizedIncome || 1)) * 100).toFixed(0)}% сбережений</span>
        </div>
      </div>

      {/* 4. Execution & Completion Rate */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all overflow-hidden group shadow-lg shadow-slate-950/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-xs font-medium text-slate-400">Выполнение плана доходов</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
                {completionRate.toFixed(1)}%
              </h3>
              <span className="text-xs text-slate-400">от целевых</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Sparkline mini-trend preview */}
        <div className="my-3 z-10">
          <svg className="w-full h-8 text-emerald-500/40" viewBox="0 0 120 30" fill="none">
            <path
              d="M0 22 Q 30 18, 60 14 T 120 4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="mt-1 pt-3 border-t border-slate-800/80 z-10">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
