import { Currency } from '../types/finance';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  UAH: '₴',
  USD: '$',
  EUR: '€',
  RUB: '₽',
  KZT: '₸',
};

export function formatCurrency(amount: number, currency: Currency = 'UAH', hideBalance = false): string {
  if (hideBalance) {
    return '•••••• ' + (CURRENCY_SYMBOLS[currency] || '₴');
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '₴';
  const formattedNumber = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  if (currency === 'USD' || currency === 'EUR') {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getCategoryColor(category: string): string {
  const palette: Record<string, string> = {
    // Incomes
    'Зарплата': '#10B981', // emerald-500
    'Фриланс и проекты': '#06B6D4', // cyan-500
    'Инвестиции и дивиденды': '#8B5CF6', // violet-500
    'Пассивный доход': '#EC4899', // pink-500
    'Аренда': '#F59E0B', // amber-500
    'Премии и бонусы': '#3B82F6', // blue-500
    'Кэшбэк и проценты': '#14B8A6', // teal-500
    'Продажи': '#6366F1', // indigo-500
    'Другое': '#94A3B8', // slate-400

    // Expenses
    'Жилье и ЖКХ': '#F43F5E',
    'Питание и продукты': '#FB923C',
    'Транспорт и авто': '#EAB308',
    'Оборудование и ПО': '#A855F7',
    'Здоровье и спорт': '#22C55E',
    'Образование': '#0EA5E9',
    'Налоги и комиссии': '#EF4444',
    'Развлечения': '#D946EF',
    'Прочее': '#64748B',
  };

  return palette[category] || '#38BDF8';
}
