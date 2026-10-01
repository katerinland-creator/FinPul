import React, { useState } from 'react';
import { WorkIncomeTemplate } from '../types/loan';
import { Currency } from '../types/finance';
import { sounds } from '../utils/soundEffects';
import { X, Briefcase, Building, DollarSign, Plus } from 'lucide-react';

interface WorkTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<WorkIncomeTemplate, 'id'>) => void;
  currency: Currency;
  editingTemplate?: WorkIncomeTemplate | null;
}

const EMPLOYMENT_TYPES: WorkIncomeTemplate['employmentType'][] = [
  'ФОП / Контракт',
  'Трудовой договор',
  'Фриланс',
  'Бизнес',
  'Пассивный доход',
];

export const WorkTemplateModal: React.FC<WorkTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  editingTemplate,
}) => {
  const [title, setTitle] = useState(editingTemplate ? editingTemplate.title : '');
  const [company, setCompany] = useState(editingTemplate ? editingTemplate.company : '');
  const [position, setPosition] = useState(editingTemplate ? editingTemplate.position : '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    editingTemplate ? String(editingTemplate.monthlyIncome) : ''
  );
  const [additionalIncome, setAdditionalIncome] = useState(
    editingTemplate ? String(editingTemplate.additionalIncome) : '0'
  );
  const [employmentType, setEmploymentType] = useState<WorkIncomeTemplate['employmentType']>(
    editingTemplate ? editingTemplate.employmentType : 'ФОП / Контракт'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(monthlyIncome.replace(/\s+/g, ''));
    const extra = parseFloat(additionalIncome.replace(/\s+/g, '') || '0');

    if (!title.trim()) {
      setError('Укажите название шаблона профиля');
      return;
    }
    if (!company.trim()) {
      setError('Укажите место работы или компанию');
      return;
    }
    if (isNaN(income) || income <= 0) {
      setError('Укажите корректный ежемесячный доход');
      return;
    }

    sounds.playAdd();
    onSave({
      title: title.trim(),
      company: company.trim(),
      position: position.trim() || 'Специалист',
      monthlyIncome: income,
      additionalIncome: isNaN(extra) ? 0 : extra,
      employmentType,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTemplate ? 'Редактировать шаблон' : 'Новый шаблон дохода и работы'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Для быстрого расчета кредитного скоринга и лимита платежа
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Закрыть модальное окно"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Название шаблона *
            </label>
            <input
              type="text"
              placeholder="Например: Основной контракт IT, Фриланс + Преподавание"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Место работы / Компания *
              </label>
              <input
                type="text"
                placeholder="ООО Компания, EPAM, Self-employed"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Должность
              </label>
              <input
                type="text"
                placeholder="Senior Engineer, Менеджер..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Чистый доход в месяц ({currency}) *
              </label>
              <input
                type="number"
                min="1000"
                step="any"
                placeholder="100000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Дополнительный доход ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="20000"
                value={additionalIncome}
                onChange={(e) => setAdditionalIncome(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Формат занятости
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 active:translate-y-0.5"
            >
              {editingTemplate ? 'Сохранить изменения' : 'Создать шаблон'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
