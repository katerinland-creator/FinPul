import React, { useState, useMemo } from 'react';
import { Currency } from '../types/finance';
import { WorkIncomeTemplate, LoanParameters } from '../types/loan';
import { calculateLoan } from '../utils/loanCalculations';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  Calculator,
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Download,
  Percent,
  Clock,
  ShieldCheck,
  Building,
  Coins,
} from 'lucide-react';

interface CreditCalculatorViewProps {
  currency: Currency;
  hideBalance: boolean;
  templates: WorkIncomeTemplate[];
  onAddTemplate: (tmpl: Omit<WorkIncomeTemplate, 'id'>) => void;
  onDeleteTemplate: (id: string) => void;
  onOpenCreateTemplateModal: () => void;
}

export const CreditCalculatorView: React.FC<CreditCalculatorViewProps> = ({
  currency,
  hideBalance,
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onOpenCreateTemplateModal,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );

  const [params, setParams] = useState<LoanParameters>({
    loanAmount: 600000,
    downPayment: 150000,
    interestRate: 15.5,
    termMonths: 36,
    paymentType: 'annuity',
    earlyPaymentMonthly: 0,
  });

  const [scheduleLimit, setScheduleLimit] = useState<'12' | 'all'>('12');

  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const totalMonthlyIncome = activeTemplate
    ? activeTemplate.monthlyIncome + (activeTemplate.additionalIncome || 0)
    : 100000;

  const result = useMemo(() => {
    return calculateLoan(params, totalMonthlyIncome);
  }, [params, totalMonthlyIncome]);

  const handleExportScheduleCSV = () => {
    sounds.playClick();
    const headers = ['Месяц', 'Дата', 'Платеж', 'Тело кредита', 'Проценты', 'Остаток задолженности'];
    const rows = result.schedule.map((m) => [
      m.month,
      `"${m.date}"`,
      m.payment.toFixed(2),
      m.principal.toFixed(2),
      m.interest.toFixed(2),
      m.remainingBalance.toFixed(2),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinPulse_Loan_Schedule_${params.termMonths}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedSchedule = scheduleLimit === '12' ? result.schedule.slice(0, 12) : result.schedule;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
              <Calculator className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Кредитный калькулятор и симулятор DTI
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-500/30">
                  Smart Scoring
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Моделируйте параметры займов, привязывайте шаблоны дохода и формируйте персональный график выплат
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenCreateTemplateModal();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:translate-y-0.5 self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Новый шаблон дохода</span>
          </button>
        </div>
      </div>

      {/* Templates Selector Carousel / Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Шаблоны по доходам и местам работы
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Активен: <strong className="text-slate-900 dark:text-white font-medium">{activeTemplate?.company}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            const totalIncome = tmpl.monthlyIncome + (tmpl.additionalIncome || 0);

            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedTemplateId(tmpl.id);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-300 font-semibold">
                      {tmpl.employmentType}
                    </span>
                    {templates.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playAlert();
                          onDeleteTemplate(tmpl.id);
                        }}
                        title="Удалить шаблон"
                        className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-tight">
                    {tmpl.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {tmpl.company} · {tmpl.position}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Чистый доход:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalIncome, currency, hideBalance)}
                    <span className="text-[10px] text-slate-400">/мес</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Параметры кредитного обязательства
          </h3>

          {/* 1. Loan Amount */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Стоимость покупки / Сумма кредита
              </label>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(params.loanAmount, currency, hideBalance)}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="3000000"
              step="10000"
              value={params.loanAmount}
              onChange={(e) => setParams({ ...params, loanAmount: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex items-center gap-1.5 mt-2">
              {[200000, 500000, 1000000, 2000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setParams({ ...params, loanAmount: preset })}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {(preset / 1000).toFixed(0)}k {currency}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Первоначальный взнос (собственные средства)
              </label>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {formatCurrency(params.downPayment, currency, hideBalance)}{' '}
                <span className="text-slate-500 text-xs">
                  ({Math.round((params.downPayment / (params.loanAmount || 1)) * 100)}%)
                </span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={params.loanAmount}
              step="5000"
              value={params.downPayment}
              onChange={(e) => setParams({ ...params, downPayment: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex items-center gap-1.5 mt-2">
              {[0, 0.1, 0.2, 0.3, 0.5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setParams({ ...params, downPayment: Math.round(params.loanAmount * pct) })}
                  className="px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {(pct * 100).toFixed(0)}%
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interest Rate & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ставка годовых (%)
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {params.interestRate}%
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="1"
                max="60"
                value={params.interestRate}
                onChange={(e) => setParams({ ...params, interestRate: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Срок кредита (месяцев)
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {params.termMonths} мес. ({(params.termMonths / 12).toFixed(1)} г.)
                </span>
              </div>
              <select
                value={params.termMonths}
                onChange={(e) => setParams({ ...params, termMonths: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={12}>12 месяцев (1 год)</option>
                <option value={24}>24 месяца (2 года)</option>
                <option value={36}>36 месяцев (3 года)</option>
                <option value={60}>60 месяцев (5 лет)</option>
                <option value={120}>120 месяцев (10 лет)</option>
                <option value={240}>240 месяцев (20 лет)</option>
              </select>
            </div>
          </div>

          {/* 4. Payment Scheme */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Схема начисления платежей
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParams({ ...params, paymentType: 'annuity' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  params.paymentType === 'annuity'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">Аннуитетный</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Платежи равными частями каждый месяц
                </p>
              </button>

              <button
                type="button"
                onClick={() => setParams({ ...params, paymentType: 'differentiated' })}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  params.paymentType === 'differentiated'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">Дифференцированный</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Платеж уменьшается с каждым месяцем
                </p>
              </button>
            </div>
          </div>

          {/* 5. Early Repayment Simulator */}
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Досрочное погашение (+ к платежу)</span>
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                +{formatCurrency(params.earlyPaymentMonthly || 0, currency, hideBalance)}/мес
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="1000"
              value={params.earlyPaymentMonthly || 0}
              onChange={(e) => setParams({ ...params, earlyPaymentMonthly: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            {result.savingsWithEarlyRepayment && result.savingsWithEarlyRepayment.interestSaved > 0 && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-2 font-medium">
                🎉 Экономия на процентах: <strong>{formatCurrency(result.savingsWithEarlyRepayment.interestSaved, currency, hideBalance)}</strong> и срок кредита меньше на <strong>{result.savingsWithEarlyRepayment.monthsSaved} мес.</strong>!
              </p>
            )}
          </div>
        </div>

        {/* Right Output: Calculation Results & DTI Gauge */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main KPI Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ежемесячный платеж
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1.5">
              {params.paymentType === 'annuity' ? (
                formatCurrency(result.monthlyPayment, currency, hideBalance)
              ) : (
                <span>
                  {formatCurrency(result.firstMonthPayment || 0, currency, hideBalance)}
                  <span className="text-xs text-slate-500 font-normal"> ...до {formatCurrency(result.lastMonthPayment || 0, currency, hideBalance)}</span>
                </span>
              )}
            </h3>

            {/* DTI (Debt-to-Income) Meter */}
            <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Нагрузка на доход (DTI / ПДН)
                </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    result.dtiStatus === 'optimal'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : result.dtiStatus === 'moderate'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {result.dtiRatio.toFixed(1)}% дохода
                </span>
              </div>

              {/* DTI Progress Track */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.dtiStatus === 'optimal'
                      ? 'bg-emerald-500'
                      : result.dtiStatus === 'moderate'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, result.dtiRatio))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span>
                  По шаблону: <strong>{activeTemplate?.company}</strong>
                </span>
                <span className="font-semibold">
                  {result.dtiStatus === 'optimal' && '✓ Высокий шанс одобрения'}
                  {result.dtiStatus === 'moderate' && '⚠ Умеренный риск'}
                  {result.dtiStatus === 'critical' && '⛔ Высокая нагрузка (>50%)'}
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Сумма к выдаче (Тело):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(params.loanAmount - params.downPayment, currency, hideBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Начисленные проценты (Переплата):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(result.totalInterest, currency, hideBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Всего выплат за весь срок:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(result.totalPayment, currency, hideBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Эффективное удорожание:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {result.effectiveRate.toFixed(1)}% от тела
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                График платежей по месяцам
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Помесячная разбивка платежа на основной долг и процентное вознаграждение банка
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setScheduleLimit('12')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  scheduleLimit === '12'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                12 месяцев
              </button>
              <button
                onClick={() => setScheduleLimit('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  scheduleLimit === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Весь график ({result.schedule.length})
              </button>
            </div>

            <button
              onClick={handleExportScheduleCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                <th className="py-3 px-4 w-14">№</th>
                <th className="py-3 px-4">Период</th>
                <th className="py-3 px-4 text-right">Платеж</th>
                <th className="py-3 px-4 text-right">Тело кредита</th>
                <th className="py-3 px-4 text-right">Проценты</th>
                <th className="py-3 px-4 text-right">Остаток долга</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {displayedSchedule.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-slate-400 font-semibold">{m.month}</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white">{m.date}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(m.payment, currency, hideBalance)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(m.principal, currency, hideBalance)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-amber-600 dark:text-amber-400">
                    {formatCurrency(m.interest, currency, hideBalance)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 dark:text-slate-400">
                    {formatCurrency(m.remainingBalance, currency, hideBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
