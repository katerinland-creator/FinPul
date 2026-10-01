import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { Currency, Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { ChartOptions } from 'chart.js';

interface CashflowBarChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const CashflowBarChart: React.FC<CashflowBarChartProps> = ({ transactions, currency }) => {
  const { labels, incomeData, expenseData, netData } = useMemo(() => {
    // Group realized transactions by Month (e.g. "2026-07", "2026-08", "2026-09", "2026-10")
    const monthMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      if (!t.isCompleted) return; // only completed
      const monthKey = t.date.slice(0, 7); // 'YYYY-MM'
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthMap[monthKey].income += t.amount;
      } else {
        monthMap[monthKey].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(monthMap).sort();

    const monthNames: Record<string, string> = {
      '01': 'Янв',
      '02': 'Фев',
      '03': 'Мар',
      '04': 'Апр',
      '05': 'Май',
      '06': 'Июн',
      '07': 'Июл',
      '08': 'Авг',
      '09': 'Сен',
      '10': 'Окт',
      '11': 'Ноя',
      '12': 'Дек',
    };

    const formattedLabels = sortedMonths.map((m) => {
      const [year, month] = m.split('-');
      return `${monthNames[month] || month} ${year}`;
    });

    const inc = sortedMonths.map((m) => monthMap[m].income);
    const exp = sortedMonths.map((m) => monthMap[m].expense);
    const net = sortedMonths.map((m) => monthMap[m].income - monthMap[m].expense);

    return {
      labels: formattedLabels,
      incomeData: inc,
      expenseData: exp,
      netData: net,
    };
  }, [transactions]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Доходы',
        data: incomeData,
        backgroundColor: '#10B981', // emerald-500
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        label: 'Расходы',
        data: expenseData,
        backgroundColor: '#EF4444', // red-500
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        label: 'Чистая прибыль (Сальдо)',
        data: netData,
        backgroundColor: '#06B6D4', // cyan-500
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
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
          boxHeight: 12,
        },
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
            return ` ${context.dataset.label}: ${formatCurrency(val, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94A3B8',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 11,
            family: "'JetBrains Mono', monospace",
          },
          callback: (value) => formatCurrency(Number(value), currency),
        },
      },
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[380px]">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-white">Денежный поток по месяцам</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Сравнение валовых доходов, операционных расходов и чистой дельты
        </p>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
