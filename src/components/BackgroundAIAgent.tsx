import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Currency, Transaction, Budget } from '../types/finance';
import { sounds } from '../utils/soundEffects';
import {
  Bot,
  Zap,
  Activity,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  Send,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface AgentReport {
  healthScore: number;
  status: 'optimal' | 'attention' | 'warning';
  headline: string;
  insight: string;
  savingTip: string;
  quickAction: string;
  anomalyDetected?: boolean;
}

interface BackgroundAIAgentProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
  hideBalance: boolean;
}

export const BackgroundAIAgent: React.FC<BackgroundAIAgentProps> = ({
  transactions,
  budgets,
  currency,
  hideBalance,
}) => {
  const [report, setReport] = useState<AgentReport>({
    healthScore: 88,
    status: 'optimal',
    headline: 'Профицитный денежный поток и стабильная динамика',
    insight: 'Ваш баланс за сентябрь находится в устойчивом плюсе. Запланированные поступления покрывают запланированные расходы на 145%.',
    savingTip: 'Удержите расходы на транспорт в пределах текущего лимита, чтобы высвободить дополнительно до 4 500 ₴ в резерв.',
    quickAction: 'Направить 10% от ближайшего транша в инвестиционную копилку',
    anomalyDetected: false,
  });

  const [loading, setLoading] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('Только что');
  const [commandInput, setCommandInput] = useState('');
  const [isLiveAgentRunning, setIsLiveAgentRunning] = useState(true);
  const prevCountRef = useRef(transactions.length);

  const runBackgroundAudit = useCallback(
    async (customCommand?: string) => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/background-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions,
            budgets,
            currency,
            command: customCommand,
          }),
        });
        const data = await res.json();
        if (data.headline) {
          setReport(data);
          setLastCheckTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
          if (data.anomalyDetected || data.status === 'warning') {
            sounds.playAlert();
          } else {
            sounds.playSuccess();
          }
        }
      } catch (e) {
        console.error('Background agent error:', e);
      } finally {
        setLoading(false);
      }
    },
    [transactions, budgets, currency]
  );

  useEffect(() => {
    if (transactions.length !== prevCountRef.current) {
      prevCountRef.current = transactions.length;
      const timer = setTimeout(() => {
        runBackgroundAudit();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [transactions.length, runBackgroundAudit]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || loading) return;
    sounds.playClick();
    const cmd = commandInput.trim();
    setCommandInput('');
    runBackgroundAudit(cmd);
  };

  const handleQuickCommand = (cmd: string) => {
    sounds.playClick();
    runBackgroundAudit(cmd);
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md shadow-slate-200/50 dark:shadow-xl dark:shadow-slate-950/20 transition-colors duration-200">
      {/* Top Bar: Status & Pulse (Clean, responsive header without WebKit blur artifacts) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            {isLiveAgentRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">AI-агент FinPulse</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold whitespace-nowrap">
                <Activity className="w-2.5 h-2.5 animate-pulse" />
                Active Monitor
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Автономный аудит денежного потока · Проверка: {lastCheckTime}
            </p>
          </div>
        </div>

        {/* Right Status Gauge: Financial Health Score */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-xs">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium tracking-wider">Health Index</p>
              <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {report.healthScore}/100
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              runBackgroundAudit();
            }}
            disabled={loading}
            title="Запустить внеочередную проверку"
            aria-label="Запустить проверку"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Agent Insight Box */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{report.headline}</h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{report.insight}</p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300/90 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-800 dark:text-amber-300">Совет по экономии: </span>
              <span>{report.savingTip}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Рекомендованное действие</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 mt-2 font-medium leading-snug">
              {report.quickAction}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Готово к применению
            </span>
          </div>
        </div>
      </div>

      {/* Fast Command Bar */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Быстрая команда агенту (напр. 'Где сэкономить 5000 ₴?', 'Анализ подписок', 'Прогноз')..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !commandInput.trim()}
            className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-sm shadow-emerald-500/20"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Выполнить</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-500 shrink-0 mr-1 hidden sm:inline">Пресеты команд:</span>
          {[
            'Где сократить траты на 10%?',
            'Аудит продуктовых расходов',
            'Прогноз накоплений на отпуск',
            'Оценить дивидендный поток',
          ].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => handleQuickCommand(cmd)}
              className="px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-lg whitespace-nowrap transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
