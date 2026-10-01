export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Зарплата'
  | 'Фриланс и проекты'
  | 'Инвестиции и дивиденды'
  | 'Пассивный доход'
  | 'Аренда'
  | 'Премии и бонусы'
  | 'Кэшбэк и проценты'
  | 'Продажи'
  | 'Другое';

export type ExpenseCategory =
  | 'Жилье и ЖКХ'
  | 'Питание и продукты'
  | 'Транспорт и авто'
  | 'Оборудование и ПО'
  | 'Здоровье и спорт'
  | 'Образование'
  | 'Налоги и комиссии'
  | 'Развлечения'
  | 'Прочее';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'crypto' | 'sbp';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: TransactionCategory;
  source: string;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  paymentMethod: PaymentMethod;
  invoiceNumber?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  period: 'month';
  alertThreshold: number;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category: string;
  color?: string;
  notes?: string;
}

export type Currency = 'UAH' | 'USD' | 'EUR' | 'RUB' | 'KZT';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
}

export type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';
