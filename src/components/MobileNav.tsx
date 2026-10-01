import React from 'react';
import { sounds } from '../utils/soundEffects';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Calculator,
  Plus,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: 'dashboard' | 'calendar' | 'execution' | 'budgets' | 'transactions' | 'analytics' | 'calculator';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'execution' | 'budgets' | 'transactions' | 'analytics' | 'calculator') => void;
  pendingCount: number;
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onOpenAddModal,
}) => {
  const handleTab = (tab: typeof activeTab) => {
    sounds.playClick();
    setActiveTab(tab);
  };

  const handleAdd = () => {
    sounds.playAdd();
    onOpenAddModal();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/90 md:hidden px-1 pb-safe transition-colors">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => handleTab('dashboard')}
          aria-label="Перейти к обзору и графикам"
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Обзор</span>
        </button>

        {/* Tab 2: Calendar */}
        <button
          onClick={() => handleTab('calendar')}
          aria-label="Перейти к финансовому календарю"
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'calendar' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Календарь</span>
        </button>

        {/* Center: Quick Add Income / Transaction */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleAdd}
            aria-label="Внести операцию"
            className="w-11 h-11 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Execution Tracker */}
        <button
          onClick={() => handleTab('execution')}
          aria-label="Перейти к плану и выполнению"
          className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'execution' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">План</span>
        </button>

        {/* Tab 4: Calculator */}
        <button
          onClick={() => handleTab('calculator')}
          aria-label="Перейти к кредитному калькулятору"
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'calculator' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Кредиты</span>
        </button>
      </div>
    </div>
  );
};
