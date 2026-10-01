import React from 'react';
import { Currency } from '../types/finance';
import { WorkIncomeTemplate } from '../types/loan';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface CreditCalculatorTileProps {
  currency: Currency;
  hideBalance: boolean;
  templates: WorkIncomeTemplate[];
  onOpenCalculator: () => void;
}

export const CreditCalculatorTile: React.FC<CreditCalculatorTileProps> = ({
  currency,
  hideBalance,
  templates,
  onOpenCalculator,
}) => {
  const activeTemplate = templates[0];
  const monthlyIncome = activeTemplate
    ? activeTemplate.monthlyIncome + (activeTemplate.additionalIncome || 0)
    : 100000;

  // Safe credit limit rule of thumb (35% DTI max annuity payment)
  const maxSafeMonthlyPayment = monthlyIncome * 0.35;
  // Estimate loan capacity at 15.5% for 3 years
  const estimatedCapacity = maxSafeMonthlyPayment * 28;

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onOpenCalculator();
      }}
      className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Calculator className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Кредитный калькулятор и шаблоны дохода
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/30">
                {templates.length} шаблона
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Профиль: <strong className="text-slate-800 dark:text-slate-200">{activeTemplate?.company || 'Работа'}</strong> · Доступный лимит до{' '}
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(estimatedCapacity, currency, hideBalance)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Безопасный платеж</p>
            <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(maxSafeMonthlyPayment, currency, hideBalance)}/мес
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-all whitespace-nowrap">
            <span>Рассчитать график</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
