import React, { useState } from 'react';
import { Budget, Currency, ExpenseCategory } from '../types/finance';
import { X, ShieldAlert, Target } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>) => void;
  currency: Currency;
  existingCategories: string[];
}

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Жилье и ЖКХ',
  'Питание и продукты',
  'Транспорт и авто',
  'Оборудование и ПО',
  'Здоровье и спорт',
  'Образование',
  'Налоги и комиссии',
  'Развлечения',
  'Прочее',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  existingCategories,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>(
    ALL_EXPENSE_CATEGORIES.find((c) => !existingCategories.includes(c)) || 'Питание и продукты'
  );
  const [limit, setLimit] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(85);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit.replace(/\s+/g, ''));
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Укажите корректную сумму лимита');
      return;
    }

    onSave({
      category,
      limit: numLimit,
      period: 'month',
      alertThreshold,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Новый бюджет категории</h3>
              <p className="text-xs text-slate-400">Установите лимит расходов на месяц</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Категория расходов
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {ALL_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Месячный лимит расходов ({currency}) *
            </label>
            <input
              type="number"
              min="100"
              step="any"
              placeholder="35000"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Порог предупреждения: {alertThreshold}%</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {limit && !isNaN(Number(limit))
                  ? `~${Math.round((Number(limit) * alertThreshold) / 100).toLocaleString('ru-RU')} ${currency}`
                  : ''}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Система предупредит при приближении расходов к установленному проценту лимита.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Примечание или цель (опционально)
            </label>
            <input
              type="text"
              placeholder="Например: Не более 15 000 на рестораны"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shadow-emerald-500/20 active:translate-y-0.5"
            >
              Сохранить бюджет
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
