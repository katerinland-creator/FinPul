import React, { useState } from 'react';
import { Currency, Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  Calendar,
  Building,
  CheckCheck,
  Undo2,
  FileText,
} from 'lucide-react';

interface ExecutionTrackerProps {
  transactions: Transaction[];
  currency: Currency;
  onToggleCompletion: (id: string) => void;
  onOpenAddModal: (type?: 'income' | 'expense', isPlanned?: boolean) => void;
  hideBalance?: boolean;
}

export const ExecutionTracker: React.FC<ExecutionTrackerProps> = ({
  transactions,
  currency,
  onToggleCompletion,
  onOpenAddModal,
  hideBalance = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const incomeTasks = transactions.filter((t) => t.type === 'income');
  const pendingTasks = incomeTasks.filter((t) => !t.isCompleted);
  const completedTasks = incomeTasks.filter((t) => t.isCompleted);

  const displayedTasks =
    filter === 'pending'
      ? pendingTasks
      : filter === 'completed'
      ? completedTasks
      : incomeTasks;

  const totalPendingAmount = pendingTasks.reduce((sum, t) => sum + t.amount, 0);
  const totalCompletedAmount = completedTasks.reduce((sum, t) => sum + t.amount, 0);

  const today = '2026-09-30';

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      sounds.playSuccess();
    } else {
      sounds.playClick();
    }
    onToggleCompletion(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <h2 className="text-xl font-bold text-white">
              Контроль выполнения и график поступлений
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Планируйте задачи, этапы проектов и отмечайте их выполнение для автоматического учета в балансе и графиках.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playAdd();
                onOpenAddModal('income', true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20 active:translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Запланировать доход</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Ожидает выполнения</p>
              <p className="text-lg font-bold text-amber-300 font-mono tabular-nums">
                {formatCurrency(totalPendingAmount, currency, hideBalance)}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {pendingTasks.length} поступлений в очереди
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Уже выполнено и зачислено</p>
              <p className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                {formatCurrency(totalCompletedAmount, currency, hideBalance)}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {completedTasks.length} подтвержденных транзакций
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Ближайший транш</p>
              <p className="text-sm font-semibold text-white">
                {pendingTasks[0] ? pendingTasks[0].dueDate || pendingTasks[0].date : 'Нет запланированных'}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                {pendingTasks[0] ? pendingTasks[0].source : 'Все транши закрыты'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => {
              sounds.playClick();
              setFilter('pending');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            К выполнению ({pendingTasks.length})
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setFilter('completed');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Выполненные ({completedTasks.length})
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setFilter('all');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все этапы ({incomeTasks.length})
          </button>
        </div>

        <p className="text-xs text-slate-400 hidden sm:block">
          Нажмите на отметку, чтобы подтвердить поступление средств
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">Все задачи выполнены!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              В данной категории нет активных задач. Запланируйте следующий этап проекта, гонорар или зарплатный платеж.
            </p>
            <button
              onClick={() => {
                sounds.playAdd();
                onOpenAddModal('income', true);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
            >
              + Запланировать новый доход
            </button>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isDueOverdue = !task.isCompleted && task.dueDate && task.dueDate < today;

            return (
              <div
                key={task.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  task.isCompleted
                    ? 'border-slate-800/80 opacity-80 hover:opacity-100'
                    : isDueOverdue
                    ? 'border-rose-500/40 hover:border-rose-500/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left side: Checkbox + Info */}
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggle(task.id, task.isCompleted)}
                    title={task.isCompleted ? 'Вернуть в план' : 'Отметить выполненным'}
                    aria-label={task.isCompleted ? 'Вернуть в план' : 'Отметить выполненным'}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                      task.isCompleted
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'border-2 border-slate-600 hover:border-amber-400 text-transparent hover:text-amber-400/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          task.isCompleted ? 'text-slate-400 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.priority === 'high' && !task.isCompleted && (
                        <span className="text-[10px] text-rose-400 border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium">
                          Срочный транш
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building className="w-3 h-3 text-slate-400" />
                        {task.source}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Срок: {formatDate(task.dueDate || task.date)}
                      </span>
                      {task.invoiceNumber && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {task.invoiceNumber}
                          </span>
                        </>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 max-w-xl">
                        {task.description}
                      </p>
                    )}

                    {task.isCompleted && task.completedAt && (
                      <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-mono">
                        <CheckCheck className="w-3 h-3" />
                        Выполнено и зачислено в баланс
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Amount & Action Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        task.isCompleted ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      +{formatCurrency(task.amount, currency, hideBalance)}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {task.isCompleted ? 'Зачислено' : 'Ожидается'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggle(task.id, task.isCompleted)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                      task.isCompleted
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 shadow-sm shadow-emerald-500/20'
                    }`}
                  >
                    {task.isCompleted ? (
                      <>
                        <Undo2 className="w-3 h-3" />
                        <span>Вернуть</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Отметить выполненным</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
