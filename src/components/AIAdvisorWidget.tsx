import React, { useState } from 'react';
import { Currency, Transaction, Budget } from '../types/finance';
import { Sparkles, Bot, Loader2, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react';

interface AIAdvisorWidgetProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
}

export const AIAdvisorWidget: React.FC<AIAdvisorWidgetProps> = ({
  transactions,
  budgets,
  currency,
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze-finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, budgets, currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка связи с сервером AI');
      }
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Не удалось получить анализ от Gemini API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-950/30 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">AI-Финансовый советник и Агент</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Интеллектуальный анализ ваших транзакций, бюджетов и советы по экономии в реальном времени
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 active:translate-y-0.5 disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Анализируем...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{analysis ? 'Обновить анализ' : 'Запустить AI-анализ'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 z-10 relative">
          {error}
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="py-6 px-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center z-10 relative">
          <Lightbulb className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-medium">
            Нажмите кнопку «Запустить AI-анализ», чтобы агент изучил ваши доходы, расходы и дал персональные рекомендации.
          </p>
        </div>
      )}

      {loading && !analysis && (
        <div className="py-10 text-center space-y-2 z-10 relative">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Агент Gemini изучает вашу финансовую активность...</p>
        </div>
      )}

      {analysis && (
        <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed z-10 relative whitespace-pre-line font-sans shadow-inner">
          {analysis}
        </div>
      )}
    </div>
  );
};
