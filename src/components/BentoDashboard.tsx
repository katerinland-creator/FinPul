import React from 'react';
import { Currency, Transaction, Budget, FinancialGoal, TransactionType } from '../types/finance';
import { WorkIncomeTemplate } from '../types/loan';
import { BackgroundAIAgent } from './BackgroundAIAgent';
import { FinancialGoalsTile } from './FinancialGoalsTile';
import { CreditCalculatorTile } from './CreditCalculatorTile';
import { EndOfMonthForecastWidget } from './charts/EndOfMonthForecastWidget';
import { IncomeTrendChart } from './charts/IncomeTrendChart';
import { CategoryDoughnutChart } from './charts/CategoryDoughnutChart';
import { CashflowBarChart } from './charts/CashflowBarChart';
import { TransactionList } from './TransactionList';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  ArrowUpRight,
  Clock,
  Wallet,
  Target,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';

interface BentoDashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  templates: WorkIncomeTemplate[];
  currency: Currency;
  hideBalance: boolean;
  onOpenExecutionTab: () => void;
  onOpenCalendarTab: () => void;
  onOpenBudgetsTab: () => void;
  onOpenTransactionsTab: () => void;
  onOpenCalculatorTab: () => void;
  onOpenCreateGoal: () => void;
  onDeleteGoal: (id: string) => void;
  onContributeGoal: (id: string, amount: number) => void;
  onToggleCompletion: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: (type?: TransactionType) => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  transactions,
  budgets,
  goals,
  templates,
  currency,
  hideBalance,
  onOpenExecutionTab,
  onOpenCalendarTab,
  onOpenBudgetsTab,
  onOpenTransactionsTab,
  onOpenCalculatorTab,
  onOpenCreateGoal,
  onDeleteGoal,
  onContributeGoal,
  onToggleCompletion,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const realizedIncomes = transactions.filter((t) => t.type === 'income' && t.isCompleted);
  const totalRealizedIncome = realizedIncomes.reduce((acc, t) => acc + t.amount, 0);

  const pendingIncomes = transactions.filter((t) => t.type === 'income' && !t.isCompleted);
  const totalPendingIncome = pendingIncomes.reduce((acc, t) => acc + t.amount, 0);

  const realizedExpenses = transactions.filter((t) => t.type === 'expense' && t.isCompleted);
  const totalRealizedExpenses = realizedExpenses.reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalRealizedIncome - totalRealizedExpenses;
  const totalPotentialIncome = totalRealizedIncome + totalPendingIncome;
  const completionRate = totalPotentialIncome > 0 ? (totalRealizedIncome / totalPotentialIncome) * 100 : 100;

  const currentMonth = '2026-09';
  const categorySpending: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.isCompleted && tx.date.startsWith(currentMonth)) {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    }
  });

  return (
    <div className="space-y-6">
      {/* BENTO TILE 1: Autonomous Background AI Agent */}
      <BackgroundAIAgent
        transactions={transactions}
        budgets={budgets}
        currency={currency}
        hideBalance={hideBalance}
      />

      {/* BENTO TILE 2: Financial Goals & Savings Progress Bar */}
      <FinancialGoalsTile
        goals={goals}
        currency={currency}
        hideBalance={hideBalance}
        onOpenCreateGoal={onOpenCreateGoal}
        onDeleteGoal={onDeleteGoal}
        onContributeGoal={onContributeGoal}
      />

      {/* BENTO TILE 3: Credit Calculator & Income Capacity Tile */}
      <CreditCalculatorTile
        currency={currency}
        hideBalance={hideBalance}
        templates={templates}
        onOpenCalculator={onOpenCalculatorTab}
      />

      {/* BENTO GRID ROW 4: 4 Prominent High-Impact Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Bento Tile 4.1: Realized Income Widget */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all group shadow-sm shadow-slate-200/50 dark:shadow-lg dark:shadow-slate-950/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Фактический доход</p>
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 font-mono tabular-nums">
                {formatCurrency(totalRealizedIncome, currency, hideBalance)}
              </h3>
            </div>
            {/* Prominent Large Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <div className="my-4">
            <svg className="w-full h-9 text-emerald-500/40" viewBox="0 0 120 30" fill="none">
              <path d="M0 25 Q 20 18, 40 20 T 80 10 T 120 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums font-bold text-xs">
              {realizedIncomes.length} транзакций
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Зачислено на счета</span>
          </div>
        </div>

        {/* Bento Tile 4.2: Pending / Scheduled Queue Widget */}
        <div
          onClick={() => {
            sounds.playClick();
            onOpenExecutionTab();
          }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all group cursor-pointer shadow-sm shadow-slate-200/50 dark:shadow-lg dark:shadow-slate-950/20"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                Ожидает поступления
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-300 mt-1.5 font-mono tabular-nums">
                {formatCurrency(totalPendingIncome, currency, hideBalance)}
              </h3>
            </div>
            {/* Prominent Large Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <Clock className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <div className="my-4">
            <svg className="w-full h-9 text-amber-500/40" viewBox="0 0 120 30" fill="none">
              <path d="M0 20 Q 30 15, 60 22 T 120 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 font-mono tabular-nums font-bold text-xs">
              {pendingIncomes.length} задач
            </span>
            <span className="text-amber-600 dark:text-amber-400 group-hover:underline text-[11px] font-semibold flex items-center gap-1">
              <span>Открыть план</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Bento Tile 4.3: Net Cashflow / Savings Widget */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all group shadow-sm shadow-slate-200/50 dark:shadow-lg dark:shadow-slate-950/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Чистый остаток (Сальдо)</p>
              <h3 className={`text-3xl font-extrabold tracking-tight mt-1.5 font-mono tabular-nums ${netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(netBalance, currency, hideBalance)}
              </h3>
            </div>
            {/* Prominent Large Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Wallet className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <div className="my-4">
            <svg className="w-full h-9 text-cyan-500/40" viewBox="0 0 120 30" fill="none">
              <path d="M0 15 Q 30 25, 60 12 T 120 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Расходы: <strong className="text-slate-800 dark:text-slate-300 font-mono">{formatCurrency(totalRealizedExpenses, currency, hideBalance)}</strong></span>
            <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">{((netBalance / (totalRealizedIncome || 1)) * 100).toFixed(0)}% сбережений</span>
          </div>
        </div>

        {/* Bento Tile 4.4: Execution / Completion Rate Widget */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all group shadow-sm shadow-slate-200/50 dark:shadow-lg dark:shadow-slate-950/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Выполнение плана</p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                  {completionRate.toFixed(1)}%
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">цели</span>
              </div>
            </div>
            {/* Prominent Large Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Target className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          <div className="my-4">
            <svg className="w-full h-9 text-emerald-500/40" viewBox="0 0 120 30" fill="none">
              <path d="M0 22 Q 30 18, 60 14 T 120 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BENTO TILE 5: RECHARTS End-Of-Month Budget Forecast Widget */}
      <EndOfMonthForecastWidget
        transactions={transactions}
        budgets={budgets}
        currency={currency}
        hideBalance={hideBalance}
      />

      {/* BENTO GRID ROW 6: Calendar Fast Banner Tile */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-slate-200/50 dark:shadow-xl dark:shadow-slate-950/20 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <CalendarIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Интерактивный финансовый календарь</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Просматривайте даты зачисления доходов, платежи и дни активности по дням
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onOpenCalendarTab();
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl transition-all whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <span>Открыть календарь</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* BENTO GRID ROW 7: Main Trend Chart (8 cols) + Budget Health (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <IncomeTrendChart transactions={transactions} currency={currency} />
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm shadow-slate-200/50 dark:shadow-xl dark:shadow-slate-950/20 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Пульс бюджетов</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Лимиты текущего месяца</p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenBudgetsTab();
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
              >
                Все →
              </button>
            </div>

            <div className="space-y-4 mt-5">
              {budgets.slice(0, 4).map((b) => {
                const spent = categorySpending[b.category] || 0;
                const pct = Math.round((spent / b.limit) * 100);
                const isExceeded = pct >= 100;
                const isNear = pct >= b.alertThreshold && !isExceeded;
                const catColor = getCategoryColor(b.category);

                return (
                  <div key={b.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor }} />
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{b.category}</span>
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatCurrency(spent, currency, hideBalance)}{' '}
                        <span className="text-slate-400 text-[10px]">/ {formatCurrency(b.limit, currency, hideBalance)}</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isExceeded ? 'bg-rose-500' : isNear ? 'bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Всего под контролем: {budgets.length} бюджетов</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Активны</span>
          </div>
        </div>
      </div>

      {/* BENTO GRID ROW 8: Dual Split (Category Breakdown + Monthly Cashflow) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDoughnutChart transactions={transactions} currency={currency} />
        <CashflowBarChart transactions={transactions} currency={currency} />
      </div>

      {/* BENTO GRID ROW 9: Transactions Stream Tile */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Недавняя финансовая активность</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Быстрый доступ к последним зачислениям, гонорарам и операциям
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenTransactionsTab();
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
          >
            Все операции ({transactions.length}) →
          </button>
        </div>

        <TransactionList
          transactions={transactions.slice(0, 8)}
          currency={currency}
          onToggleCompletion={(id) => {
            sounds.playSuccess();
            onToggleCompletion(id);
          }}
          onDeleteTransaction={(id) => {
            sounds.playAlert();
            onDeleteTransaction(id);
          }}
          onOpenAddModal={onOpenAddModal}
          hideBalance={hideBalance}
        />
      </div>
    </div>
  );
};
