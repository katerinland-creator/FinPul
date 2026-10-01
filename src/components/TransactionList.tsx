import React, { useState, useMemo } from 'react';
import { Currency, Transaction, TransactionType } from '../types/finance';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import {
  Search,
  CheckCircle2,
  Trash2,
  Download,
  Calendar,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Laptop,
  TrendingUp,
  Sparkles,
  Building,
  Award,
  CreditCard,
  ShoppingBag,
  Home,
  ShoppingCart,
  Car,
  Cpu,
  HeartPulse,
  GraduationCap,
  Receipt,
  Film,
  Folder,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  currency: Currency;
  onToggleCompletion: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: (type?: TransactionType) => void;
  hideBalance: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currency,
  onToggleCompletion,
  onDeleteTransaction,
  onOpenAddModal,
  hideBalance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeDatePreset, setActiveDatePreset] = useState<string>('all');
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState<boolean>(true);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Зарплата': return <Briefcase className="w-3.5 h-3.5" />;
      case 'Фриланс и проекты': return <Laptop className="w-3.5 h-3.5" />;
      case 'Инвестиции и дивиденды': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'Пассивный доход': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Аренда': return <Building className="w-3.5 h-3.5" />;
      case 'Премии и бонусы': return <Award className="w-3.5 h-3.5" />;
      case 'Кэшбэк и проценты': return <CreditCard className="w-3.5 h-3.5" />;
      case 'Продажи': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Жилье и ЖКХ': return <Home className="w-3.5 h-3.5" />;
      case 'Питание и продукты': return <ShoppingCart className="w-3.5 h-3.5" />;
      case 'Транспорт и авто': return <Car className="w-3.5 h-3.5" />;
      case 'Оборудование и ПО': return <Cpu className="w-3.5 h-3.5" />;
      case 'Здоровье и спорт': return <HeartPulse className="w-3.5 h-3.5" />;
      case 'Образование': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Налоги и комиссии': return <Receipt className="w-3.5 h-3.5" />;
      case 'Развлечения': return <Film className="w-3.5 h-3.5" />;
      default: return <Folder className="w-3.5 h-3.5" />;
    }
  };

  const applyDatePreset = (preset: 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'all') => {
    setActiveDatePreset(preset);
    const anchor = new Date('2026-09-30T12:00:00Z');

    switch (preset) {
      case 'today':
        setStartDate('2026-09-30');
        setEndDate('2026-09-30');
        break;
      case '7d': {
        const d = new Date(anchor);
        d.setDate(d.getDate() - 7);
        setStartDate(d.toISOString().slice(0, 10));
        setEndDate('2026-09-30');
        break;
      }
      case '30d': {
        const d = new Date(anchor);
        d.setDate(d.getDate() - 30);
        setStartDate(d.toISOString().slice(0, 10));
        setEndDate('2026-09-30');
        break;
      }
      case 'this_month':
        setStartDate('2026-09-01');
        setEndDate('2026-09-30');
        break;
      case 'last_month':
        setStartDate('2026-08-01');
        setEndDate('2026-08-31');
        break;
      case 'all':
      default:
        setStartDate('');
        setEndDate('');
        break;
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setActiveDatePreset('all');
  };

  const isAnyFilterActive =
    searchTerm.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter === 'income' && t.type !== 'income') return false;
      if (typeFilter === 'expense' && t.type !== 'expense') return false;
      if (typeFilter === 'pending' && (t.type !== 'income' || t.isCompleted)) return false;

      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesSource = t.source.toLowerCase().includes(query);
        const matchesDesc = (t.description || '').toLowerCase().includes(query);
        const matchesInvoice = (t.invoiceNumber || '').toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSource && !matchesDesc && !matchesInvoice && !matchesCategory) {
          return false;
        }
      }

      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm, startDate, endDate]);

  const filteredStats = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;
    let pendingSum = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') {
        if (t.isCompleted) {
          incomeSum += t.amount;
        } else {
          pendingSum += t.amount;
        }
      } else {
        expenseSum += t.amount;
      }
    });

    const net = incomeSum - expenseSum;

    return {
      count: filteredTransactions.length,
      incomeSum,
      expenseSum,
      pendingSum,
      net,
    };
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Тип', 'Название', 'Сумма', 'Категория', 'Источник', 'Дата', 'Статус', 'Способ оплаты', 'Номер счета'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.type === 'income' ? 'Доход' : 'Расход',
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.category}"`,
      `"${t.source.replace(/"/g, '""')}"`,
      t.date,
      t.isCompleted ? 'Выполнено' : 'В ожидании',
      t.paymentMethod,
      t.invoiceNumber || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinPulse_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md shadow-slate-200/50 dark:shadow-xl dark:shadow-slate-950/20 transition-colors duration-200">
      {/* Search & Filter Header Panel */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Журнал финансовых транзакций</h3>
              {isAnyFilterActive && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                  Фильтры активны
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Поиск по ключевым словам в названии, выборка по диапазону дат и категориям
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterPanelExpanded(!isFilterPanelExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700/60 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isFilterPanelExpanded ? 'Скрыть панель фильтров' : 'Параметры фильтрации'}
              </span>
              <span className="sm:hidden">Фильтры</span>
              {isFilterPanelExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleExportCSV}
              title="Экспорт найденных записей в CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors border border-slate-200 dark:border-slate-700/60 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Экспорт CSV</span>
            </button>
          </div>
        </div>

        {isFilterPanelExpanded && (
          <div className="space-y-3.5 pt-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск по названию (напр. Зарплата, Фриланс, Дивиденды, Аренда)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    title="Очистить поиск"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4">
                <select
                  value={categoryFilter}
                  aria-label="Фильтр по категориям"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
                >
                  <option value="all">Все категории ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shrink-0 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Период дат:</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">с</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setActiveDatePreset('custom');
                    }}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">по</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setActiveDatePreset('custom');
                    }}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setActiveDatePreset('all');
                    }}
                    title="Сбросить даты"
                    className="text-[11px] text-slate-400 hover:text-rose-500 p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
                <span className="text-[11px] text-slate-400 shrink-0 mr-1 hidden sm:inline">Быстро:</span>
                {(
                  [
                    { id: 'all', label: 'Всё время' },
                    { id: 'today', label: 'Сегодня' },
                    { id: '7d', label: '7 дней' },
                    { id: 'this_month', label: 'Этот месяц' },
                    { id: 'last_month', label: 'Прошлый месяц' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyDatePreset(preset.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeDatePreset === preset.id
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-w-full shadow-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Все операции ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              typeFilter === 'income'
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Доходы
          </button>
          <button
            onClick={() => setTypeFilter('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              typeFilter === 'pending'
                ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            К выполнению
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              typeFilter === 'expense'
                ? 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Расходы
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="text-slate-500 dark:text-slate-400">
            Найдено:{' '}
            <strong className="text-slate-900 dark:text-white font-mono">{filteredStats.count}</strong>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">|</span>
          <div className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums font-semibold">
            +{formatCurrency(filteredStats.incomeSum, currency, hideBalance)}
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">|</span>
          <div className="text-rose-600 dark:text-rose-400 font-mono tabular-nums font-semibold">
            −{formatCurrency(filteredStats.expenseSum, currency, hideBalance)}
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">|</span>
          <div
            className={`font-mono tabular-nums font-semibold ${
              filteredStats.net >= 0 ? 'text-cyan-700 dark:text-cyan-300' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {filteredStats.net >= 0 ? '+' : ''}
            {formatCurrency(filteredStats.net, currency, hideBalance)}
          </div>

          {isAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              title="Сбросить все параметры поиска"
              className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline transition-colors ml-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-950/40">
              <th className="py-3 px-4 w-10 text-center">Статус</th>
              <th className="py-3 px-4">Операция и источник</th>
              <th className="py-3 px-4">Категория</th>
              <th className="py-3 px-4">Дата</th>
              <th className="py-3 px-4 text-right">Сумма ({currency})</th>
              <th className="py-3 px-4 w-12 text-center">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500 dark:text-slate-400">
                  <div className="max-w-sm mx-auto space-y-2">
                    <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Ничего не найдено</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      По запросу {searchTerm ? `«${searchTerm}»` : ''} в заданном диапазоне дат записи отсутствуют.
                    </p>
                    {isAnyFilterActive && (
                      <button
                        onClick={resetAllFilters}
                        className="mt-3 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors font-medium"
                      >
                        Сбросить фильтры поиска
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const catColor = getCategoryColor(tx.category);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center">
                      {isIncome ? (
                        <button
                          onClick={() => onToggleCompletion(tx.id)}
                          title={tx.isCompleted ? 'Отмечено как выполнено' : 'Ожидает выполнения'}
                          aria-label={tx.isCompleted ? 'Отмечено как выполнено' : 'Ожидает выполнения'}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors mx-auto ${
                            tx.isCompleted
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                              : 'border border-amber-500/50 text-transparent hover:text-amber-500 bg-amber-500/10'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                          <span className="text-[10px]">•</span>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <span>{tx.source}</span>
                        {tx.invoiceNumber && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-500 dark:text-slate-400">{tx.invoiceNumber}</span>
                          </>
                        )}
                        {!tx.isCompleted && isIncome && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">в ожидании</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: `${catColor}20`, color: catColor }}
                        >
                          {getCategoryIcon(tx.category)}
                        </div>
                        <span className="text-slate-700 dark:text-slate-200">{tx.category}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {formatDate(tx.date)}
                    </td>

                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold font-mono tabular-nums text-sm ${
                          !tx.isCompleted
                            ? 'text-amber-600 dark:text-amber-300'
                            : isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '−'}
                        {formatCurrency(tx.amount, currency, hideBalance)}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Удалить запись"
                        aria-label="Удалить запись"
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-300">Ничего не найдено</p>
            <p className="mt-1">Попробуйте изменить поисковый запрос или диапазон дат.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const catColor = getCategoryColor(tx.category);

            return (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isIncome ? (
                    <button
                      onClick={() => onToggleCompletion(tx.id)}
                      title={tx.isCompleted ? 'Отмечено как выполнено' : 'Ожидает выполнения'}
                      aria-label={tx.isCompleted ? 'Отмечено как выполнено' : 'Ожидает выполнения'}
                      className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        tx.isCompleted
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                          : 'border-2 border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="min-w-[44px] min-h-[44px] rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                      <span className="text-xs font-mono font-bold">−</span>
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${tx.isCompleted ? 'text-slate-900 dark:text-white' : 'text-amber-700 dark:text-amber-200'}`}>
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span>{tx.source}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${catColor}20`, color: catColor }}
                      >
                        {getCategoryIcon(tx.category)}
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`font-bold font-mono tabular-nums text-sm ${
                      !tx.isCompleted
                        ? 'text-amber-600 dark:text-amber-300'
                        : isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatCurrency(tx.amount, currency, hideBalance)}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {!tx.isCompleted && isIncome && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">в плане</span>
                    )}
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      aria-label="Удалить запись"
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
