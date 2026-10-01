import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../types/finance';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  PlusCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface FinancialCalendarProps {
  transactions: Transaction[];
  currency: Currency;
  onToggleCompletion: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModalWithDate: (date: string, type?: 'income' | 'expense') => void;
  hideBalance?: boolean;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  transactions,
  currency,
  onToggleCompletion,
  onDeleteTransaction,
  onOpenAddModalWithDate,
  hideBalance = false,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // September
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-30');

  const handlePrevMonth = () => {
    sounds.playClick();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    sounds.playClick();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    sounds.playClick();
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDate('2026-09-30');
  };

  const handleDaySelect = (d: string) => {
    sounds.playClick();
    setSelectedDate(d);
  };

  const handleToggle = (id: string, isCompleted: boolean) => {
    if (!isCompleted) {
      sounds.playSuccess();
    } else {
      sounds.playClick();
    }
    onToggleCompletion(id);
  };

  const handleDelete = (id: string) => {
    sounds.playAlert();
    onDeleteTransaction(id);
  };

  const transactionsByDate = useMemo(() => {
    const map: Record<
      string,
      {
        incomes: Transaction[];
        expenses: Transaction[];
        realizedIncomeTotal: number;
        plannedIncomeTotal: number;
        expenseTotal: number;
      }
    > = {};

    transactions.forEach((tx) => {
      const dateKey = tx.date;
      if (!map[dateKey]) {
        map[dateKey] = {
          incomes: [],
          expenses: [],
          realizedIncomeTotal: 0,
          plannedIncomeTotal: 0,
          expenseTotal: 0,
        };
      }

      if (tx.type === 'income') {
        map[dateKey].incomes.push(tx);
        if (tx.isCompleted) {
          map[dateKey].realizedIncomeTotal += tx.amount;
        } else {
          map[dateKey].plannedIncomeTotal += tx.amount;
        }
      } else {
        map[dateKey].expenses.push(tx);
        map[dateKey].expenseTotal += tx.amount;
      }
    });

    return map;
  }, [transactions]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const monthStr = currentMonth === 0 ? '12' : String(currentMonth).padStart(2, '0');
      const yearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${yearVal}-${monthStr}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remainingSlots = totalSlots - days.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const monthStr = currentMonth === 11 ? '01' : String(currentMonth + 2).padStart(2, '0');
      const yearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${yearVal}-${monthStr}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthStats = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    let monthIncome = 0;
    let monthPlanned = 0;
    let monthExpense = 0;
    let daysWithActivity = 0;

    Object.entries(transactionsByDate).forEach(([date, data]) => {
      if (date.startsWith(prefix)) {
        monthIncome += data.realizedIncomeTotal;
        monthPlanned += data.plannedIncomeTotal;
        monthExpense += data.expenseTotal;
        if (data.incomes.length > 0 || data.expenses.length > 0) {
          daysWithActivity++;
        }
      }
    });

    const netCashflow = monthIncome - monthExpense;

    return {
      monthIncome,
      monthPlanned,
      monthExpense,
      netCashflow,
      daysWithActivity,
    };
  }, [currentYear, currentMonth, transactionsByDate]);

  const selectedDayData = transactionsByDate[selectedDate] || {
    incomes: [],
    expenses: [],
    realizedIncomeTotal: 0,
    plannedIncomeTotal: 0,
    expenseTotal: 0,
  };

  const selectedDayAll = [...selectedDayData.incomes, ...selectedDayData.expenses];

  return (
    <div className="space-y-6">
      {/* Top Header & Month Summary Strip */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 overflow-hidden shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Финансовый календарь</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Обзор поступления доходов и дат совершения расходов по дням месяца
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors border border-slate-700/60"
            >
              Сентябрь 2026
            </button>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={handlePrevMonth}
                aria-label="Предыдущий месяц"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-semibold text-white min-w-[130px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                aria-label="Следующий месяц"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 z-10 relative">
          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Доход за месяц</span>
            </p>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
              +{formatCurrency(monthStats.monthIncome, currency, hideBalance)}
            </p>
            {monthStats.monthPlanned > 0 && (
              <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                +{formatCurrency(monthStats.monthPlanned, currency, hideBalance)} в плане
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Расходы за месяц</span>
            </p>
            <p className="text-lg sm:text-xl font-bold text-rose-400 font-mono tabular-nums mt-0.5">
              −{formatCurrency(monthStats.monthExpense, currency, hideBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {((monthStats.monthExpense / (monthStats.monthIncome || 1)) * 100).toFixed(0)}% от дохода
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Сальдо (Чистый итог)</span>
            </p>
            <p
              className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5 ${
                monthStats.netCashflow >= 0 ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
              {monthStats.netCashflow >= 0 ? '+' : ''}
              {formatCurrency(monthStats.netCashflow, currency, hideBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">денежный поток</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Активных дней</p>
            <p className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              {monthStats.daysWithActivity} дн.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">с операциями</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (2/3) + Selected Day Detail on Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col shadow-xl shadow-slate-950/20">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-1.5 ${idx >= 5 ? 'text-amber-400/70' : 'text-slate-400'}`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1">
            {calendarDays.map((item) => {
              const dayData = transactionsByDate[item.date];
              const hasRealizedIncome = dayData && dayData.realizedIncomeTotal > 0;
              const hasPlannedIncome = dayData && dayData.plannedIncomeTotal > 0;
              const hasExpense = dayData && dayData.expenseTotal > 0;
              const isSelected = selectedDate === item.date;
              const isToday = item.date === '2026-09-30';

              return (
                <button
                  key={item.date}
                  onClick={() => handleDaySelect(item.date)}
                  className={`min-h-[70px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-2xl text-left flex flex-col justify-between transition-all border relative group ${
                    isSelected
                      ? 'border-emerald-400 bg-slate-800/90 ring-1 ring-emerald-400/50'
                      : item.isCurrentMonth
                      ? 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50 hover:border-slate-700'
                      : 'border-transparent bg-slate-950/20 opacity-35 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold'
                          : isSelected
                          ? 'text-emerald-300'
                          : item.isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {hasRealizedIncome && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                      {hasPlannedIncome && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                      {hasExpense && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      )}
                    </div>
                  </div>

                  <div className="mt-1 space-y-0.5 w-full hidden sm:block">
                    {hasRealizedIncome && (
                      <div className="text-[10px] font-mono font-semibold text-emerald-400 truncate bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                        +{formatCurrency(dayData.realizedIncomeTotal, currency, hideBalance)}
                      </div>
                    )}
                    {hasPlannedIncome && (
                      <div className="text-[10px] font-mono text-amber-300 truncate bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                        ⏳ +{formatCurrency(dayData.plannedIncomeTotal, currency, hideBalance)}
                      </div>
                    )}
                    {hasExpense && (
                      <div className="text-[10px] font-mono font-semibold text-rose-400 truncate bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
                        −{formatCurrency(dayData.expenseTotal, currency, hideBalance)}
                      </div>
                    )}
                  </div>

                  <div className="sm:hidden flex items-center gap-1 mt-auto">
                    {dayData && (dayData.incomes.length > 0 || dayData.expenses.length > 0) && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {dayData.incomes.length + dayData.expenses.length} оп.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
              <span>Поступление дохода</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
              <span>Запланированный доход (план)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-400" />
              <span>Совершенный расход</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-[8px] text-slate-950 font-bold flex items-center justify-center">
                ●
              </span>
              <span>Текущая дата</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Day Transactions Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl shadow-slate-950/20">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Финансовая активность за день</p>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {formatDate(selectedDate)}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    sounds.playAdd();
                    onOpenAddModalWithDate(selectedDate, 'income');
                  }}
                  title="Добавить доход на эту дату"
                  className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Доход</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playAdd();
                    onOpenAddModalWithDate(selectedDate, 'expense');
                  }}
                  title="Добавить расход на эту дату"
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors border border-slate-700/60"
                >
                  − Расход
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-950 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400">Доходы за день:</span>
                <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                  +{formatCurrency(selectedDayData.realizedIncomeTotal, currency, hideBalance)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Расходы за день:</span>
                <p className="text-sm font-bold text-rose-400 font-mono tabular-nums">
                  −{formatCurrency(selectedDayData.expenseTotal, currency, hideBalance)}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {selectedDayAll.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p>На эту дату операций не зафиксировано.</p>
                  <button
                    onClick={() => {
                      sounds.playAdd();
                      onOpenAddModalWithDate(selectedDate, 'income');
                    }}
                    className="mt-3 text-xs text-emerald-400 hover:underline inline-block font-medium"
                  >
                    + Записать операцию на {formatDate(selectedDate)}
                  </button>
                </div>
              ) : (
                selectedDayAll.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isIncome ? (
                          <button
                            onClick={() => handleToggle(tx.id, tx.isCompleted)}
                            title={
                              tx.isCompleted
                                ? 'Выполнено (кликните для возврата в план)'
                                : 'Ожидает выполнения (кликните для подтверждения)'
                            }
                            aria-label={tx.isCompleted ? 'Отмечено как выполнено' : 'Ожидает выполнения'}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 active:scale-90 ${
                              tx.isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'border border-amber-500/50 text-transparent hover:text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="w-5 h-5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold">−</span>
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {tx.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 truncate">
                            <span>{tx.source}</span>
                            <span aria-hidden="true">·</span>
                            <span>{tx.category}</span>
                            {!tx.isCompleted && isIncome && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-400 font-medium">в плане</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-bold font-mono tabular-nums ${
                            !tx.isCompleted
                              ? 'text-amber-300'
                              : isIncome
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '−'}
                          {formatCurrency(tx.amount, currency, hideBalance)}
                        </span>

                        <button
                          onClick={() => handleDelete(tx.id)}
                          title="Удалить"
                          aria-label="Удалить запись"
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            Выберите любой день календаря для детального аудита
          </div>
        </div>
      </div>
    </div>
  );
};
