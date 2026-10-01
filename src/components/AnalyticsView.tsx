import React, { useMemo } from 'react';
import { Currency, Transaction } from '../types/finance';
import { CategoryDoughnutChart } from './charts/CategoryDoughnutChart';
import { CashflowBarChart } from './charts/CashflowBarChart';
import { formatCurrency } from '../utils/formatters';
import { CreditCard, TrendingUp, Award, Layers } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: Currency;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, currency }) => {
  const realizedIncomes = useMemo(
    () => transactions.filter((t) => t.type === 'income' && t.isCompleted),
    [transactions]
  );

  // Method breakdown
  const methodStats = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    realizedIncomes.forEach((t) => {
      const method = t.paymentMethod || 'card';
      if (!map[method]) map[method] = { count: 0, total: 0 };
      map[method].count += 1;
      map[method].total += t.amount;
    });

    const labels: Record<string, string> = {
      card: 'Банковская карта',
      sbp: 'Система быстрых платежей (СБП)',
      bank_transfer: 'Банковский перевод (Р/С)',
      crypto: 'Криптовалюта (USDT/BTC)',
      cash: 'Наличные',
    };

    return Object.entries(map).map(([m, stats]) => ({
      methodKey: m,
      name: labels[m] || m,
      count: stats.count,
      total: stats.total,
    }));
  }, [realizedIncomes]);

  // Top source
  const topSource = useMemo(() => {
    const srcMap: Record<string, number> = {};
    realizedIncomes.forEach((t) => {
      srcMap[t.source] = (srcMap[t.source] || 0) + t.amount;
    });
    const sorted = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], total: sorted[0][1] } : null;
  }, [realizedIncomes]);

  const avgIncome = realizedIncomes.length > 0
    ? realizedIncomes.reduce((s, t) => s + t.amount, 0) / realizedIncomes.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Главный источник дохода</p>
              <p className="text-base font-bold text-white truncate max-w-[200px]">
                {topSource ? topSource.name : '—'}
              </p>
              <p className="text-xs text-emerald-400 font-mono tabular-nums">
                {topSource ? formatCurrency(topSource.total, currency) : '0 ₽'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Средний чек поступления</p>
              <p className="text-lg font-bold text-white font-mono tabular-nums">
                {formatCurrency(avgIncome, currency)}
              </p>
              <p className="text-xs text-slate-400">по {realizedIncomes.length} транзакциям</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Диверсификация источников</p>
              <p className="text-lg font-bold text-white font-mono">
                {methodStats.length} канала приема
              </p>
              <p className="text-xs text-slate-400">карта, сбп, р/с, крипто</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDoughnutChart transactions={transactions} currency={currency} />
        <CashflowBarChart transactions={transactions} currency={currency} />
      </div>

      {/* Payment methods breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-base font-semibold text-white mb-1">
          Распределение доходов по способам зачисления
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Анализ платежных инструментов, используемых для получения средств
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {methodStats.map((item) => (
            <div
              key={item.methodKey}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium truncate">{item.name}</span>
              </div>
              <div className="mt-3">
                <p className="text-base font-bold text-white font-mono tabular-nums">
                  {formatCurrency(item.total, currency)}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {item.count} операций
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
