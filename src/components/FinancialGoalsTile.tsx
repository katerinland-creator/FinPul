import React, { useState } from 'react';
import { Currency, FinancialGoal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  Target,
  Plus,
  Trash2,
  Coins,
} from 'lucide-react';

interface FinancialGoalsTileProps {
  goals: FinancialGoal[];
  currency: Currency;
  hideBalance: boolean;
  onOpenCreateGoal: () => void;
  onDeleteGoal: (id: string) => void;
  onContributeGoal: (id: string, amount: number) => void;
}

export const FinancialGoalsTile: React.FC<FinancialGoalsTileProps> = ({
  goals,
  currency,
  hideBalance,
  onOpenCreateGoal,
  onDeleteGoal,
  onContributeGoal,
}) => {
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState<string>('');

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleQuickAdd = (goalId: string, delta: number) => {
    sounds.playSuccess();
    onContributeGoal(goalId, delta);
  };

  const handleContributeSubmit = (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    const val = parseFloat(contributeAmount.replace(/\s+/g, ''));
    if (!isNaN(val) && val > 0) {
      sounds.playSuccess();
      onContributeGoal(goalId, val);
      setContributeGoalId(null);
      setContributeAmount('');
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm shadow-slate-200/50 dark:shadow-xl dark:shadow-slate-950/20 transition-colors duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Финансовые цели и накопления</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                {goals.length} активных
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Устанавливайте целевые суммы, отслеживайте прогресс и пополняйте копилки
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenCreateGoal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 active:translate-y-0.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Новая цель</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 pt-1 z-10 relative">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">Совокупная цель</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
            {formatCurrency(totalTarget, currency, hideBalance)}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">Уже накоплено</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
            {formatCurrency(totalSaved, currency, hideBalance)}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Общий прогресс</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{overallPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, overallPct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Individual Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);
          const color = g.color || '#10B981';

          return (
            <div
              key={g.id}
              className="bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-300">
                      {g.category}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playAlert();
                      onDeleteGoal(g.id);
                    }}
                    title="Удалить цель"
                    aria-label="Удалить цель"
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2 tracking-tight line-clamp-1">
                  {g.title}
                </h4>

                {g.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{g.notes}</p>}

                {/* Progress bar and percentages */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-xs mb-1 font-mono tabular-nums">
                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                      {formatCurrency(g.currentAmount, currency, hideBalance)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      из {formatCurrency(g.targetAmount, currency, hideBalance)}
                    </span>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700 shadow-sm"
                      style={{
                        width: `${Math.min(100, Math.max(2, pct))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                    <span className="font-semibold" style={{ color }}>{pct}% накоплено</span>
                    <span>Осталось: {formatCurrency(remaining, currency, hideBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                {contributeGoalId === g.id ? (
                  <form
                    onSubmit={(e) => handleContributeSubmit(e, g.id)}
                    className="flex items-center gap-1.5 animate-in fade-in duration-150"
                  >
                    <input
                      type="number"
                      autoFocus
                      placeholder="Сумма..."
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shrink-0"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setContributeGoalId(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-white px-1"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickAdd(g.id, 1000)}
                        title="Добавить +1 000 ₴"
                        className="px-2 py-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md transition-colors"
                      >
                        +1k
                      </button>
                      <button
                        onClick={() => handleQuickAdd(g.id, 5000)}
                        title="Добавить +5 000 ₴"
                        className="px-2 py-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md transition-colors"
                      >
                        +5k
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setContributeGoalId(g.id);
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3" />
                      <span>Пополнить</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
