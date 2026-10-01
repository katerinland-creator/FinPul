import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { Currency, Transaction } from '../../types/finance';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';
import { ChartOptions } from 'chart.js';

interface CategoryDoughnutChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const CategoryDoughnutChart: React.FC<CategoryDoughnutChartProps> = ({ transactions, currency }) => {
  const { categoryTotals, totalIncome, sortedCategories } = useMemo(() => {
    // Only completed income
    const incomeTx = transactions.filter((t) => t.type === 'income' && t.isCompleted);
    const totals: Record<string, number> = {};
    let sum = 0;

    incomeTx.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      sum += t.amount;
    });

    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

    return {
      categoryTotals: totals,
      totalIncome: sum,
      sortedCategories: sorted,
    };
  }, [transactions]);

  const labels = sortedCategories.map(([cat]) => cat);
  const values = sortedCategories.map(([, val]) => val);
  const colors = labels.map((cat) => getCategoryColor(cat));

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#0F172A',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(51, 65, 85, 0.7)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        padding: 12,
        callbacks: {
          label: (context) => {
            const val = context.raw as number;
            const pct = totalIncome > 0 ? ((val / totalIncome) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${formatCurrency(val, currency)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[400px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Структура источников дохода</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Распределение фактически полученных средств по категориям
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-4 min-h-0">
        {/* Doughnut Chart Canvas with Center Stat */}
        <div className="relative w-full h-[220px] flex items-center justify-center">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-medium text-slate-400">Всего дохода</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {formatCurrency(totalIncome, currency)}
            </span>
          </div>
        </div>

        {/* Legend list with tabular figures */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {sortedCategories.map(([cat, amount]) => {
            const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : '0';
            const color = getCategoryColor(cat);

            return (
              <div
                key={cat}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 truncate">{cat}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                  <span className="text-slate-400 text-[11px]">{percentage}%</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
