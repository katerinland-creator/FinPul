import React, { useState } from 'react';
import { Currency, FinancialGoal } from '../types/finance';
import { sounds } from '../utils/soundEffects';
import { X, Target, Plus, Calendar, DollarSign, Tag } from 'lucide-react';

interface FinancialGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<FinancialGoal, 'id'>) => void;
  currency: Currency;
  editingGoal?: FinancialGoal | null;
}

const GOAL_COLORS = [
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EC4899', // pink
  '#3B82F6', // blue
];

const GOAL_CATEGORIES = [
  'Безопасность',
  'Недвижимость',
  'Оборудование',
  'Автомобиль',
  'Инвестиции',
  'Путешествия',
  'Образование',
  'Другое',
];

export const FinancialGoalModal: React.FC<FinancialGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  editingGoal,
}) => {
  const [title, setTitle] = useState(editingGoal ? editingGoal.title : '');
  const [targetAmount, setTargetAmount] = useState(editingGoal ? String(editingGoal.targetAmount) : '');
  const [currentAmount, setCurrentAmount] = useState(editingGoal ? String(editingGoal.currentAmount) : '');
  const [targetDate, setTargetDate] = useState(editingGoal ? editingGoal.targetDate || '' : '2026-12-31');
  const [category, setCategory] = useState(editingGoal ? editingGoal.category : 'Безопасность');
  const [color, setColor] = useState(editingGoal ? editingGoal.color || '#10B981' : '#10B981');
  const [notes, setNotes] = useState(editingGoal ? editingGoal.notes || '' : '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount.replace(/\s+/g, ''));
    const numCurrent = parseFloat(currentAmount.replace(/\s+/g, '') || '0');

    if (!title.trim()) {
      setError('Укажите название финансовой цели');
      return;
    }
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Укажите корректную целевую сумму накопления');
      return;
    }
    if (isNaN(numCurrent) || numCurrent < 0) {
      setError('Укажите корректную текущую сумму');
      return;
    }

    sounds.playAdd();
    onSave({
      title: title.trim(),
      targetAmount: numTarget,
      currentAmount: numCurrent,
      targetDate: targetDate || undefined,
      category,
      color,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-bold"
              style={{ backgroundColor: color }}
            >
              <Target className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingGoal ? 'Редактировать цель' : 'Новая финансовая цель'}
              </h3>
              <p className="text-xs text-slate-400">
                Задайте целевую сумму и отслеживайте накопление капитала
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Закрыть модальное окно"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Название цели *
            </label>
            <input
              type="text"
              placeholder="Например: Подушка безопасности, Первый взнос, Автомобиль"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Целевая сумма ({currency}) *
              </label>
              <input
                type="number"
                min="100"
                step="any"
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Уже накоплено ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="25000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Желаемая дата достижения
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Цветовой акцент цели
            </label>
            <div className="flex items-center gap-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition-all ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Заметки или стратегия накопления
            </label>
            <input
              type="text"
              placeholder="Например: Откладывать 10% от каждого гонорара"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 active:translate-y-0.5"
            >
              {editingGoal ? 'Сохранить изменения' : 'Создать цель'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
