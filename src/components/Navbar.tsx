import React, { useState } from 'react';
import { Currency } from '../types/finance';
import { sounds } from '../utils/soundEffects';
import {
  PlusCircle,
  TrendingUp,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Calculator,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'calendar' | 'execution' | 'budgets' | 'transactions' | 'analytics' | 'calculator';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'execution' | 'budgets' | 'transactions' | 'analytics' | 'calculator') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenAddModal: (type?: 'income' | 'expense') => void;
  pendingCount: number;
  onResetData: () => void;
  hideBalance: boolean;
  setHideBalance: (val: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenAddModal,
  pendingCount,
  onResetData,
  hideBalance,
  setHideBalance,
  theme,
  setTheme,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  const handleTabChange = (tab: typeof activeTab) => {
    sounds.playClick();
    setActiveTab(tab);
  };

  const handleToggleTheme = () => {
    sounds.playClick();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-slate-950/20 transition-colors duration-200">
      {/* Brand logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            handleTabChange('dashboard');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-extrabold tracking-tight">FinPulse</span>
        </a>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs lg:text-sm font-medium">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Обзор (Bento)
        </button>
        <button
          onClick={() => handleTabChange('calendar')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 ${
            activeTab === 'calendar'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Календарь</span>
        </button>
        <button
          onClick={() => handleTabChange('execution')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 ${
            activeTab === 'execution'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>План и выполнение</span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded border border-amber-500/30">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('calculator')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 ${
            activeTab === 'calculator'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Кредитный калькулятор</span>
        </button>
        <button
          onClick={() => handleTabChange('budgets')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'budgets'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Бюджеты
        </button>
        <button
          onClick={() => handleTabChange('transactions')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'transactions'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Журнал транзакций
        </button>
        <button
          onClick={() => handleTabChange('analytics')}
          className={`transition-colors whitespace-nowrap py-1 ${
            activeTab === 'analytics'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Аналитика
        </button>
      </nav>

      {/* Action controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={handleToggleTheme}
          title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
          className={`p-2 rounded-xl border transition-colors shrink-0 ${
            theme === 'light'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
              : 'bg-slate-800 border-slate-700/80 text-amber-400 hover:text-amber-300'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          title={soundEnabled ? 'Звуковые эффекты включены' : 'Звуковые эффекты выключены'}
          aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          className={`p-2 rounded-xl border transition-colors shrink-0 ${
            soundEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Privacy Mode Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            setHideBalance(!hideBalance);
          }}
          title={hideBalance ? 'Показать балансы' : 'Скрыть суммы'}
          aria-label={hideBalance ? 'Показать балансы' : 'Скрыть балансы'}
          className={`p-2 rounded-xl border transition-colors shrink-0 ${
            hideBalance
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
          }`}
        >
          {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Currency selector */}
        <select
          value={currency}
          aria-label="Основная валюта"
          onChange={(e) => {
            sounds.playClick();
            setCurrency(e.target.value as Currency);
          }}
          className="bg-slate-100 dark:bg-slate-800 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shrink-0"
        >
          <option value="UAH">₴ UAH</option>
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
          <option value="RUB">₽ RUB</option>
          <option value="KZT">₸ KZT</option>
        </select>

        {/* Reset button (Desktop) */}
        <button
          onClick={() => {
            sounds.playClick();
            onResetData();
          }}
          title="Сбросить к исходным данным"
          aria-label="Сбросить к исходным данным"
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:block shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Primary action button */}
        <button
          onClick={() => {
            sounds.playAdd();
            onOpenAddModal('income');
          }}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20 active:translate-y-0.5 shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Ввести доход</span>
        </button>
      </div>
    </header>
  );
};
