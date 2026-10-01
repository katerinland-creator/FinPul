import { WorkIncomeTemplate, LoanParameters } from '../types/loan';

export const INITIAL_WORK_TEMPLATES: WorkIncomeTemplate[] = [
  {
    id: 'work-1',
    title: 'Senior Software Engineer (Основной контракт)',
    company: 'Tech Solutions Global',
    position: 'Lead Fullstack Developer',
    monthlyIncome: 135000,
    additionalIncome: 25000,
    employmentType: 'ФОП / Контракт',
    isDefault: true,
  },
  {
    id: 'work-2',
    title: 'Product Designer (Штатная должность)',
    company: 'Fintech Mobile Apps',
    position: 'Senior UI/UX Designer',
    monthlyIncome: 85000,
    additionalIncome: 15000,
    employmentType: 'Трудовой договор',
  },
  {
    id: 'work-3',
    title: 'Частная практика & Консалтинг',
    company: 'Self-employed / Фриланс',
    position: 'IT & Финтех Консультант',
    monthlyIncome: 95000,
    additionalIncome: 20000,
    employmentType: 'Фриланс',
  },
];

export const DEFAULT_LOAN_PARAMS: LoanParameters = {
  loanAmount: 600000,
  downPayment: 150000,
  interestRate: 15.5,
  termMonths: 36,
  paymentType: 'annuity',
  earlyPaymentMonthly: 0,
};
