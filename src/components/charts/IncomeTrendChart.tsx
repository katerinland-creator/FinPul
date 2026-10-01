import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { Currency, TimeRange, Transaction } from '../../types/finance';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { ChartOptions, ScriptableContext } from 'chart.js';

interface IncomeTrendChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const IncomeTrendChart: React.FC<IncomeTrendChartProps> = ({ transactions, currency }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const [showPlanned, setShowPlanned] = useState<boolean>(true);

  // Filter transactions by timeRange and group by date
  const chartData = useMemo(() => {
    const now = new Date('2026-09-30T12:00:00Z');
    let cutoff = new Date(now);

    switch (timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      case '6m':
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        cutoff = new Date('2020-01-01');
        break;
    }

    // Only income transactions
    const incomeTx = transactions.filter((t) => t.type === 'income');

    // Collect all dates
    const dateMap: Record<string, { realized: number; planned: number; total: number; titles: string[] }> = {};

    incomeTx.forEach((t) => {
      const txDate = new Date(t.date);
      // For planned items, allow future dates up to 60 days
      if (t.isCompleted && txDate < cutoff) return;

      const dateKey = t.date;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { realized: 0, planned: 0, total: 0, titles: [] };
      }

      if (t.isCompleted) {
        dateMap[dateKey].realized += t.amount;
      } else {
        dateMap[dateKey].planned += t.amount;
      }
      dateMap[dateKey].total += t.amount;
      dateMap[dateKey].titles.push(t.title);
    });

    const sortedDates = Object.keys(dateMap).sort();

    const labels = sortedDates.map((d) => formatShortDate(d));
    const realizedData = sortedDates.map((d) => dateMap[d].realized);
    const plannedData = sortedDates.map((d) => dateMap[d].planned);

    return {
      labels,
      sortedDates,
      realizedData,
      plannedData,
      dateMap,
    };
  }, [transactions, timeRange]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Фактический доход (Реализован)',
        data: chartData.realizedData,
        borderColor: '#10B981', // emerald-500
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#0F172A',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(showPlanned
        ? [
            {
              label: 'Запланированный доход (К получению)',
              data: chartData.plannedData,
              borderColor: '#F59E0B', // amber-500
              borderDash: [6, 4],
              backgroundColor: (context: ScriptableContext<'line'>) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 320);
                gradient.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
                gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
                return gradient;
              },
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointBackgroundColor: '#F59E0B',
              pointBorderColor: '#0F172A',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Custom legend below for anti-slop design
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(51, 65, 85, 0.7)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (item) => {
            const val = item.raw as number;
            if (val === 0) return '';
            return ` ${item.dataset.label}: ${formatCurrency(val, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
        },
        ticks: {
          color: '#94A3B8',
          maxRotation: 0,
          font: {
            size: 11,
          },
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[400px]">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Динамика и прогноз поступлений дохода</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Фактически подтвержденные зачисления и запланированные поступления
          </p>
        </div>

        {/* Controls: Segmented button filters */}
        <div className="flex items-center gap-2">
          {/* Show planned toggle */}
          <button
            onClick={() => setShowPlanned(!showPlanned)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              showPlanned
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showPlanned ? '✓ План включен' : '+ Показать план'}
          </button>

          {/* Time range tabs */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(['30d', '90d', '6m', '1y', 'all'] as TimeRange[]).map((range) => {
              const labelMap: Record<TimeRange, string> = {
                '7d': '7д',
                '30d': '30д',
                '90d': '3мес',
                '6m': '6мес',
                '1y': '1год',
                'all': 'Всё',
              };
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeRange === range
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labelMap[range]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Legend row */}
      <div className="flex items-center gap-5 text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          <span>Факт (Реализовано)</span>
        </div>
        {showPlanned && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" />
            <span>План (Ожидает отметки выполнения)</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full min-h-0 relative">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
