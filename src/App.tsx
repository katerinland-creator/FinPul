import React, { useState, useEffect } from 'react';
import { Currency, Transaction, Budget, FinancialGoal, TransactionType } from './types/finance';
import { WorkIncomeTemplate } from './types/loan';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_GOALS } from './data/initialData';
import { INITIAL_WORK_TEMPLATES } from './data/initialLoanTemplates';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { BentoDashboard } from './components/BentoDashboard';
import { ExecutionTracker } from './components/ExecutionTracker';
import { FinancialCalendar } from './components/FinancialCalendar';
import { BudgetView } from './components/BudgetView';
import { BudgetModal } from './components/BudgetModal';
import { FinancialGoalModal } from './components/FinancialGoalModal';
import { CreditCalculatorView } from './components/CreditCalculatorView';
import { WorkTemplateModal } from './components/WorkTemplateModal';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AnalyticsView } from './components/AnalyticsView';
import { formatCurrency } from './utils/formatters';
import { sounds } from './utils/soundEffects';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_TX = 'finpulse_transactions_v4';
const STORAGE_KEY_BUDGETS = 'finpulse_budgets_v4';
const STORAGE_KEY_GOALS = 'finpulse_goals_v4';
const STORAGE_KEY_TEMPLATES = 'finpulse_loan_templates_v1';
const STORAGE_KEY_CURRENCY = 'finpulse_currency_v4';
const STORAGE_KEY_THEME = 'finpulse_theme';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_GOALS;
  });

  const [workTemplates, setWorkTemplates] = useState<WorkIncomeTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WORK_TEMPLATES;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (saved && ['UAH', 'USD', 'EUR', 'RUB', 'KZT'].includes(saved)) {
        return saved as Currency;
      }
    } catch (e) {
      console.error(e);
    }
    return 'UAH';
  });

  const [hideBalance, setHideBalance] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'calendar' | 'execution' | 'budgets' | 'transactions' | 'analytics' | 'calculator'
  >('dashboard');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [modalIsPlanned, setModalIsPlanned] = useState<boolean>(false);
  const [modalDate, setModalDate] = useState<string>('2026-09-30');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const [isWorkTemplateModalOpen, setIsWorkTemplateModalOpen] = useState(false);
  const [editingWorkTemplate, setEditingWorkTemplate] = useState<WorkIncomeTemplate | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error(e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(workTemplates));
    } catch (e) {
      console.error(e);
    }
  }, [workTemplates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
    } catch (e) {
      console.error(e);
    }
  }, [currency]);

  const handleToggleCompletion = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = !t.isCompleted;
          if (newStatus) {
            sounds.playSuccess();
            showToast(`✓ Доход «${t.title}» зачислен (+${formatCurrency(t.amount, currency, hideBalance)})`);
          } else {
            sounds.playClick();
            showToast(`«${t.title}» возвращен в список запланированных`);
          }
          return {
            ...t,
            isCompleted: newStatus,
            completedAt: newStatus ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (newTx.type === 'income') {
      sounds.playSuccess();
      if (newTx.isCompleted) {
        showToast(`Доход «${newTx.title}» (+${formatCurrency(newTx.amount, currency, hideBalance)}) зачислен!`);
      } else {
        showToast(`Ожидаемый доход «${newTx.title}» добавлен в план`);
      }
    } else {
      sounds.playAdd();
      showToast(`Расход «${newTx.title}» (−${formatCurrency(newTx.amount, currency, hideBalance)}) записан`);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    sounds.playAlert();
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Запись удалена');
  };

  const handleAddBudget = (newBudgetData: Omit<Budget, 'id'>) => {
    sounds.playAdd();
    const newBudget: Budget = {
      ...newBudgetData,
      id: `budget-${Date.now()}`,
    };
    setBudgets((prev) => [newBudget, ...prev]);
    showToast(`Бюджет для категории «${newBudget.category}» установлен`);
  };

  const handleDeleteBudget = (id: string) => {
    sounds.playAlert();
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Бюджет удален');
  };

  const handleSaveGoal = (goalData: Omit<FinancialGoal, 'id'>) => {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) => (g.id === editingGoal.id ? { ...goalData, id: g.id } : g))
      );
      showToast(`Цель «${goalData.title}» обновлена`);
    } else {
      const newGoal: FinancialGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
      };
      setGoals((prev) => [newGoal, ...prev]);
      showToast(`Цель «${newGoal.title}» создана`);
    }
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Цель удалена');
  };

  const handleContributeGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = g.currentAmount + amount;
          if (updated >= g.targetAmount && g.currentAmount < g.targetAmount) {
            showToast(`🎉 Поздравляем! Цель «${g.title}» полностью достигнута!`);
          } else {
            showToast(`Пополнено +${formatCurrency(amount, currency, hideBalance)} в цель «${g.title}»`);
          }
          return { ...g, currentAmount: updated };
        }
        return g;
      })
    );
  };

  // Work & Income Templates Handlers
  const handleSaveWorkTemplate = (templateData: Omit<WorkIncomeTemplate, 'id'>) => {
    if (editingWorkTemplate) {
      setWorkTemplates((prev) =>
        prev.map((t) => (t.id === editingWorkTemplate.id ? { ...templateData, id: t.id } : t))
      );
      showToast(`Шаблон дохода «${templateData.title}» обновлен`);
    } else {
      const newTmpl: WorkIncomeTemplate = {
        ...templateData,
        id: `work-${Date.now()}`,
      };
      setWorkTemplates((prev) => [newTmpl, ...prev]);
      showToast(`Шаблон «${newTmpl.title}» успешно сохранен`);
    }
    setEditingWorkTemplate(null);
  };

  const handleDeleteWorkTemplate = (id: string) => {
    setWorkTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Шаблон дохода удален');
  };

  const handleResetData = () => {
    if (confirm('Сбросить все изменения и загрузить демонстрационные данные с целями и шаблонами дохода?')) {
      sounds.playSuccess();
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setGoals(INITIAL_GOALS);
      setWorkTemplates(INITIAL_WORK_TEMPLATES);
      setCurrency('UAH');
      showToast('Данные успешно сброшены к начальному состоянию');
    }
  };

  const openAddModal = (
    type: TransactionType = 'income',
    isPlanned = false,
    date = '2026-09-30'
  ) => {
    sounds.playClick();
    setModalType(type);
    setModalIsPlanned(isPlanned);
    setModalDate(date);
    setIsAddModalOpen(true);
  };

  const pendingIncomesCount = transactions.filter((t) => t.type === 'income' && !t.isCompleted).length;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300'
          : 'bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-800'
      }`}
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAddModal={() => openAddModal('income', false)}
        pendingCount={pendingIncomesCount}
        onResetData={handleResetData}
        hideBalance={hideBalance}
        setHideBalance={setHideBalance}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
        {/* TAB 1: Bento Grid Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-200">
            <BentoDashboard
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              templates={workTemplates}
              currency={currency}
              hideBalance={hideBalance}
              onOpenExecutionTab={() => setActiveTab('execution')}
              onOpenCalendarTab={() => setActiveTab('calendar')}
              onOpenBudgetsTab={() => setActiveTab('budgets')}
              onOpenTransactionsTab={() => setActiveTab('transactions')}
              onOpenCalculatorTab={() => setActiveTab('calculator')}
              onOpenCreateGoal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onContributeGoal={handleContributeGoal}
              onToggleCompletion={handleToggleCompletion}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={openAddModal}
            />
          </div>
        )}

        {/* TAB 2: Financial Calendar */}
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in duration-200">
            <FinancialCalendar
              transactions={transactions}
              currency={currency}
              onToggleCompletion={handleToggleCompletion}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModalWithDate={(date, type) => openAddModal(type || 'income', false, date)}
              hideBalance={hideBalance}
            />
          </div>
        )}

        {/* TAB 3: Execution Tracker */}
        {activeTab === 'execution' && (
          <div className="animate-in fade-in duration-200">
            <ExecutionTracker
              transactions={transactions}
              currency={currency}
              onToggleCompletion={handleToggleCompletion}
              onOpenAddModal={(type, isPlanned) => openAddModal(type, isPlanned)}
              hideBalance={hideBalance}
            />
          </div>
        )}

        {/* TAB 4: Credit Calculator View (NEW) */}
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200">
            <CreditCalculatorView
              currency={currency}
              hideBalance={hideBalance}
              templates={workTemplates}
              onAddTemplate={handleSaveWorkTemplate}
              onDeleteTemplate={handleDeleteWorkTemplate}
              onOpenCreateTemplateModal={() => {
                setEditingWorkTemplate(null);
                setIsWorkTemplateModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 5: Budgets */}
        {activeTab === 'budgets' && (
          <div className="animate-in fade-in duration-200">
            <BudgetView
              budgets={budgets}
              transactions={transactions}
              currency={currency}
              onOpenBudgetModal={() => {
                sounds.playAdd();
                setIsBudgetModalOpen(true);
              }}
              onDeleteBudget={handleDeleteBudget}
              onOpenAddExpenseModal={() => openAddModal('expense', false)}
              hideBalance={hideBalance}
            />
          </div>
        )}

        {/* TAB 6: Transactions Log */}
        {activeTab === 'transactions' && (
          <div className="animate-in fade-in duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Учет и история транзакций</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Полная ведомость всех поступлений, гонораров и расходов в гривнах (₴)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAddModal('expense', false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
                >
                  − Расход
                </button>
                <button
                  onClick={() => openAddModal('income', false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                >
                  + Ввести доход
                </button>
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              currency={currency}
              onToggleCompletion={handleToggleCompletion}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={openAddModal}
              hideBalance={hideBalance}
            />
          </div>
        )}

        {/* TAB 7: Analytics */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsView transactions={transactions} currency={currency} />
          </div>
        )}
      </main>

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingIncomesCount}
        onOpenAddModal={() => openAddModal('income', false)}
      />

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
        initialType={modalType}
        initialIsPlanned={modalIsPlanned}
        initialDate={modalDate}
        currency={currency}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleAddBudget}
        currency={currency}
        existingCategories={budgets.map((b) => b.category)}
      />

      <FinancialGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        currency={currency}
        editingGoal={editingGoal}
      />

      <WorkTemplateModal
        isOpen={isWorkTemplateModalOpen}
        onClose={() => {
          setIsWorkTemplateModalOpen(false);
          setEditingWorkTemplate(null);
        }}
        onSave={handleSaveWorkTemplate}
        currency={currency}
        editingTemplate={editingWorkTemplate}
      />

      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
