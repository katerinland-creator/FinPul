import React, { useState, useEffect, useRef } from 'react';
import { Currency, IncomeCategory, ExpenseCategory, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { detectCategory } from '../utils/categoryDetector';
import { parseVoiceInput } from '../utils/speechParser';
import { getCategoryColor } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';
import {
  X,
  Sparkles,
  Mic,
  MicOff,
  Briefcase,
  Laptop,
  TrendingUp,
  Home,
  ShoppingCart,
  Car,
  Cpu,
  HeartPulse,
  GraduationCap,
  Receipt,
  Film,
  Folder,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Radio,
  AlertCircle,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
  initialIsPlanned?: boolean;
  initialDate?: string;
  currency: Currency;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Зарплата',
  'Фриланс и проекты',
  'Инвестиции и дивиденды',
  'Пассивный доход',
  'Аренда',
  'Премии и бонусы',
  'Кэшбэк и проценты',
  'Продажи',
  'Другое',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'income',
  initialIsPlanned = false,
  initialDate,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(
    initialType === 'income' ? 'Зарплата' : 'Питание и продукты'
  );
  const [source, setSource] = useState('');
  const [date, setDate] = useState(initialDate || '2026-09-30');
  const [dueDate, setDueDate] = useState(initialDate || '2026-10-05');
  const [isCompleted, setIsCompleted] = useState<boolean>(!initialIsPlanned);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [error, setError] = useState('');
  const [detectedBadge, setDetectedBadge] = useState<{ category: string; keyword: string } | null>(null);

  // Web Speech API states
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Sync initial props when modal re-opens
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setIsCompleted(!initialIsPlanned);
      if (initialDate) {
        setDate(initialDate);
        setDueDate(initialDate);
      }
      setCategory(initialType === 'income' ? 'Зарплата' : 'Питание и продукты');
      setError('');
      setTitle('');
      setAmount('');
      setSource('');
      setInvoiceNumber('');
      setDescription('');
      setDetectedBadge(null);
      setVoiceTranscript(null);
      setVoiceNotice(null);
      setIsRecording(false);
    }
  }, [isOpen, initialType, initialIsPlanned, initialDate]);

  // Clean up recognition on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Web Speech API Voice Handler
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      sounds.playClick();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Голосовой ввод не поддерживается вашим браузером. Попробуйте Google Chrome или Safari.');
      return;
    }

    try {
      sounds.playClick();
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceNotice('Слушаю вас... Назовите операцию и сумму (напр. «Такси 250 гривен»)');
        setError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);

        // Parse speech using parser engine
        const parsed = parseVoiceInput(transcript);

        // Populate title
        if (parsed.title) {
          setTitle(parsed.title);
        }

        // Populate amount
        if (parsed.amount !== null && parsed.amount > 0) {
          setAmount(String(parsed.amount));
        }

        // Populate type if detected
        if (parsed.type) {
          setType(parsed.type);
        }

        // Populate category if detected
        if (parsed.category) {
          setCategory(parsed.category);
          setDetectedBadge({
            category: parsed.category,
            keyword: parsed.matchedKeyword || 'голос',
          });
        }

        sounds.playSuccess();
        setVoiceNotice(
          `Распознано: «${transcript}» → ${parsed.amount ? `${parsed.amount} ₴, ` : ''}${parsed.category || ''}`
        );
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError('Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.');
        } else if (event.error === 'no-speech') {
          setVoiceNotice('Голос не обнаружен. Попробуйте еще раз.');
        } else {
          setError(`Ошибка распознавания речи: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      setIsRecording(false);
      setError('Не удалось запустить микрофон');
    }
  };

  // Real-time automatic category detection as user types transaction title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const detection = detectCategory(val, type);
    if (detection) {
      setCategory(detection.category);
      setDetectedBadge({
        category: detection.category,
        keyword: detection.matchedKeyword,
      });
    } else {
      setDetectedBadge(null);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    sounds.playClick();
    setType(newType);
    setCategory(newType === 'income' ? 'Зарплата' : 'Питание и продукты');
    const detection = detectCategory(title, newType);
    if (detection) {
      setCategory(detection.category);
      setDetectedBadge({ category: detection.category, keyword: detection.matchedKeyword });
    } else {
      setDetectedBadge(null);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/\s+/g, ''));
    if (!title.trim()) {
      setError('Укажите название транзакции или источника');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Укажите корректную сумму');
      return;
    }

    onSave({
      type,
      title: title.trim(),
      amount: numAmount,
      category: category as any,
      source: source.trim() || (type === 'income' ? 'Частное лицо / Компания' : 'Магазин / Сервис'),
      date: isCompleted ? date : (dueDate || date),
      dueDate: isCompleted ? undefined : dueDate,
      description: description.trim() || undefined,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      paymentMethod,
      invoiceNumber: invoiceNumber.trim() || undefined,
      priority: isCompleted ? undefined : priority,
    });

    onClose();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Зарплата': return <Briefcase className="w-4 h-4" />;
      case 'Фриланс и проекты': return <Laptop className="w-4 h-4" />;
      case 'Инвестиции и дивиденды': return <TrendingUp className="w-4 h-4" />;
      case 'Жилье и ЖКХ': return <Home className="w-4 h-4" />;
      case 'Питание и продукты': return <ShoppingCart className="w-4 h-4" />;
      case 'Транспорт и авто': return <Car className="w-4 h-4" />;
      case 'Оборудование и ПО': return <Cpu className="w-4 h-4" />;
      case 'Здоровье и спорт': return <HeartPulse className="w-4 h-4" />;
      case 'Образование': return <GraduationCap className="w-4 h-4" />;
      case 'Налоги и комиссии': return <Receipt className="w-4 h-4" />;
      case 'Развлечения': return <Film className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Prominent Header with Large Icon Widget & Voice Recording Button */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {type === 'income' ? <ArrowUpRight className="w-6 h-6 stroke-[2.5]" /> : <ArrowDownRight className="w-6 h-6 stroke-[2.5]" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {type === 'income' ? 'Новое поступление дохода' : 'Запись расхода'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Голосовой ввод Web Speech API и авто-определение категорий
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Voice Recording Button in Header */}
            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              title={isRecording ? 'Остановить запись' : 'Голосовой ввод транзакции'}
              aria-label={isRecording ? 'Остановить запись' : 'Голосовой ввод транзакции'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30 shadow-lg'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isRecording ? (
                <>
                  <Radio className="w-3.5 h-3.5 animate-spin" />
                  <span>Слушаю...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Голосом</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              aria-label="Закрыть модальное окно"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Voice Assistant Notification Card */}
          {isRecording ? (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {voiceNotice || 'Идет запись... Назовите операцию и сумму'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                className="px-2.5 py-1 text-[11px] font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Готово
              </button>
            </div>
          ) : voiceNotice ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium">{voiceNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceNotice(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Голосовой ассистент: </span>
                  <span>скажите, например, <em>«Продукты 850 гривен»</em> или <em>«Зарплата 45000»</em></span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Записать голосом</span>
              </button>
            </div>
          )}

          {/* Type Selector (Chunky Switcher) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Доход / Поступление</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>− Расход / Списание</span>
            </button>
          </div>

          {/* Large Hero Amount Input */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Сумма операции ({currency}) *
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold font-mono text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none"
                required
              />
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {currency}
              </span>
            </div>
          </div>

          {/* Title Input with Real-time Auto-Categorization */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Название или описание транзакции *
              </label>
              {detectedBadge && (
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in duration-200">
                  <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>Категория подобрана автоматически ✨</span>
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Например: Продукты в Сильпо, Бензин OKKO, Подписка Figma, Такси Uber..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                required
              />
              {/* Quick mic button inside input */}
              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                title="Надиктовать голосом"
                aria-label="Надиктовать голосом"
                className={`absolute right-3 p-1.5 rounded-xl transition-colors ${
                  isRecording
                    ? 'text-rose-500 animate-pulse bg-rose-500/10'
                    : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Category Chips with Large Pronounced Icons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Категория
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentCategories.map((cat) => {
                const isSelected = category === cat;
                const catColor = getCategoryColor(cat);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCategory(cat);
                      setDetectedBadge(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/40 shadow-xs font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: `${catColor}25`, color: catColor }}
                    >
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="text-xs truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid: Source & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {type === 'income' ? 'Контрагент / Клиент' : 'Магазин / Сервис'}
              </label>
              <input
                type="text"
                placeholder={type === 'income' ? 'ООО Компания, Заказчик' : 'Супермаркет, АЗС, Банк'}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Дата операции
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Операция уже совершена и оплачена
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isCompleted ? 'Сумма сразу учтется в балансе' : 'Будет добавлена в очередь запланированных'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsCompleted(!isCompleted);
              }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950'
                  : 'border-2 border-slate-400 dark:border-slate-600 text-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all shadow-md shadow-emerald-500/20 active:translate-y-0.5"
            >
              {type === 'income' ? '+ Записать доход' : '− Записать расход'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
