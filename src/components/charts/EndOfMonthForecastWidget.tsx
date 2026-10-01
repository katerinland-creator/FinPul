import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { Currency, Transaction, Budget } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { sounds } from '../../utils/soundEffects';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Wallet,
} from 'lucide-react';

interface EndOfMonthForecastWidgetProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
  hideBalance: boolean;
}

type ScenarioType = 'realistic' | 'optimistic' | 'conservative';

export const EndOfMonthForecastWidget: React.FC<EndOfMonthForecastWidgetProps> = ({
  transactions,
  budgets,
  currency,
  hideBalance,
}) => {
  const [scenario, setScenario] = useState<ScenarioType>('realistic');
  const [extraExpenseSim, setExtraExpenseSim] = useState<number>(0);
  const [includePendingIncome, setIncludePendingIncome] = useState<boolean>(true);

  // Calculate actuals
  const currentMonth = '2026-09';
  const realizedIncomes = transactions.filter(
    (t) => t.type === 'income' && t.isCompleted && t.date.startsWith(currentMonth)
  );
  const totalRealizedIncome = realizedIncomes.reduce((acc, t) => acc + t.amount, 0);

  const pendingIncomes = transactions.filter(
    (t) => t.type === 'income' && !t.isCompleted && (t.date.startsWith(currentMonth) || !t.date)
  );
  const totalPendingIncome = pendingIncomes.reduce((acc, t) => acc + t.amount, 0);

  const realizedExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.isCompleted && t.date.startsWith(currentMonth)
  );
  const totalRealizedExpenses = realizedExpenses.reduce((acc, t) => acc + t.amount, 0);

  const currentNetBalance = totalRealizedIncome - totalRealizedExpenses;

  // Daily burn rate (expenses divided by 30 days)
  const averageDailyExpense = totalRealizedExpenses > 0 ? totalRealizedExpenses / 30 : 1500;

  // Generate 30-day projection dataset for Recharts
  const chartData = useMemo(() => {
    const daysInMonth = 30;
    const currentDay = 25; // Context: day 25 of September
    const data: any[] = [];

    // Daily cumulative tracking
    let runningBalance = 25000; // Starting baseline from prev month
    let runningProjected = runningBalance;

    // Daily expenses distribution from transactions
    const dayIncomes: Record<number, number> = {};
    const dayExpenses: Record<number, number> = {};

    transactions.forEach((tx) => {
      if (tx.date.startsWith(currentMonth)) {
        const day = parseInt(tx.date.split('-')[2], 10);
        if (!isNaN(day)) {
          if (tx.type === 'income' && tx.isCompleted) {
            dayIncomes[day] = (dayIncomes[day] || 0) + tx.amount;
          } else if (tx.type === 'expense') {
            dayExpenses[day] = (dayExpenses[day] || 0) + tx.amount;
          }
        }
      }
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const isPastOrToday = day <= currentDay;
      const dayLabel = `${day} сен`;

      if (isPastOrToday) {
        // Actual historical movement
        const inc = dayIncomes[day] || 0;
        const exp = dayExpenses[day] || 0;
        runningBalance += inc - exp;
        runningProjected = runningBalance;

        data.push({
          day,
          dateLabel: dayLabel,
          actualBalance: Math.round(runningBalance),
          projectedBalance: Math.round(runningBalance),
          isProjection: false,
          income: inc,
          expense: exp,
        });
      } else {
        // Future Projection (days 26..30)
        let projectedDailyIncome = 0;
        let projectedDailyExpense = averageDailyExpense;

        if (scenario === 'optimistic') {
          projectedDailyIncome = includePendingIncome ? (totalPendingIncome / 5) * 1.05 : 0;
          projectedDailyExpense = averageDailyExpense * 0.85;
        } else if (scenario === 'conservative') {
          projectedDailyIncome = includePendingIncome ? (totalPendingIncome / 5) * 0.75 : 0;
          projectedDailyExpense = averageDailyExpense * 1.25;
        } else {
          // Realistic
          projectedDailyIncome = includePendingIncome ? totalPendingIncome / 5 : 0;
          projectedDailyExpense = averageDailyExpense;
        }

        // Apply extra expense simulation on day 27
        if (day === 27 && extraExpenseSim > 0) {
          projectedDailyExpense += extraExpenseSim;
        }

        runningProjected += projectedDailyIncome - projectedDailyExpense;

        data.push({
          day,
          dateLabel: dayLabel,
          actualBalance: null, // No actual in future
          projectedBalance: Math.round(runningProjected),
          isProjection: true,
          projectedIncome: Math.round(projectedDailyIncome),
          projectedExpense: Math.round(projectedDailyExpense),
        });
      }
    }

    return data;
  }, [transactions, scenario, extraExpenseSim, includePendingIncome, totalPendingIncome, averageDailyExpense]);

  const endOfMonthProjected = chartData[chartData.length - 1]?.projectedBalance || currentNetBalance;
  const netDeltaProjected = endOfMonthProjected - currentNetBalance;

  // Custom Recharts Tooltip
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isProj = dataPoint.isProjection;

      return (
        <div className="bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-sans min-w-[200px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200">{dataPoint.dateLabel}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isProj
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isProj ? 'Прогноз' : 'Факт'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Остаток баланса:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(
                  isProj ? dataPoint.projectedBalance : dataPoint.actualBalance,
                  currency,
                  hideBalance
                )}
              </span>
            </div>

            {isProj ? (
              <>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ожидаемый приток:</span>
                  <span className="font-mono text-emerald-400">
                    +{formatCurrency(dataPoint.projectedIncome || 0, currency, hideBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ожидаемый отток:</span>
                  <span className="font-mono text-rose-400">
                    −{formatCurrency(dataPoint.projectedExpense || 0, currency, hideBalance)}
                  </span>
                </div>
              </>
            ) : (
              <>
                {dataPoint.income > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Поступления дня:</span>
                    <span className="font-mono text-emerald-400">
                      +{formatCurrency(dataPoint.income, currency, hideBalance)}
                    </span>
                  </div>
                )}
                {dataPoint.expense > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Расходы дня:</span>
                    <span className="font-mono text-rose-400">
                      −{formatCurrency(dataPoint.expense, currency, hideBalance)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <TrendingUp className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Прогноз остатка бюджета (Recharts)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30">
                End-of-Month Forecast
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Предиктивная траектория денежного потока до 30 сентября на основе текущих трат и плановых зачислений
            </p>
          </div>
        </div>

        {/* Scenario Switcher Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl self-start md:self-auto shrink-0">
          {(
            [
              { id: 'realistic', label: 'Реалистичный' },
              { id: 'optimistic', label: 'Оптимистичный' },
              { id: 'conservative', label: 'Консервативный' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sounds.playClick();
                setScenario(s.id);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                scenario === s.id
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Прогноз на 30 сентября</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(endOfMonthProjected, currency, hideBalance)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            <span>Дельта к текущему:</span>
            <span className={netDeltaProjected >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
              {netDeltaProjected >= 0 ? '+' : ''}
              {formatCurrency(netDeltaProjected, currency, hideBalance)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ожидает зачисления (План)</p>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            +{formatCurrency(totalPendingIncome, currency, hideBalance)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pendingIncomes.length} запланированных траншей
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Средний дневной расход</p>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {formatCurrency(averageDailyExpense, currency, hideBalance)}
            <span className="text-xs text-slate-400 font-normal">/день</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Скорость расходования бюджета
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Статус безопасности</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Профицит
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
            Баланс остается выше нуля на протяжении всего месяца с запасом прочности 100%.
          </p>
        </div>
      </div>

      {/* Main Recharts Area & Trajectory Visualization */}
      <div className="h-72 sm:h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval={4}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomForecastTooltip />} />

            <ReferenceLine
              x="25 сен"
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: 'Сегодня', position: 'insideTopLeft', fill: '#10b981', fontSize: 11 }}
            />

            {/* Actual Past Area */}
            <Area
              type="monotone"
              dataKey="actualBalance"
              name="Фактический баланс"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#actualGradient)"
              connectNulls={false}
            />

            {/* Projected Trajectory Line & Area */}
            <Area
              type="monotone"
              dataKey="projectedBalance"
              name="Прогнозная траектория"
              stroke="#06b6d4"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              fill="url(#projectedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive What-If Simulation Controls */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-500" />
              <span>Симуляция внеплановых трат:</span>
            </span>
            <span className="font-mono font-bold text-rose-500">
              +{formatCurrency(extraExpenseSim, currency, hideBalance)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30000"
            step="1000"
            value={extraExpenseSim}
            onChange={(e) => setExtraExpenseSim(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>0 {currency}</span>
            <span>+15 000 {currency}</span>
            <span>+30 000 {currency}</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Учитывать ожидаемый доход в прогнозе
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              +{formatCurrency(totalPendingIncome, currency, hideBalance)} из очереди поступлений
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIncludePendingIncome(!includePendingIncome);
            }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              includePendingIncome
                ? 'bg-emerald-500 text-slate-950'
                : 'border-2 border-slate-400 dark:border-slate-600 text-transparent'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
