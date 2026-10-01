export interface WorkIncomeTemplate {
  id: string;
  title: string;
  company: string;
  position: string;
  monthlyIncome: number;
  additionalIncome: number;
  employmentType: 'Трудовой договор' | 'ФОП / Контракт' | 'Фриланс' | 'Бизнес' | 'Пассивный доход';
  isDefault?: boolean;
}

export interface LoanParameters {
  loanAmount: number;
  downPayment: number;
  interestRate: number; // e.g. 14.5%
  termMonths: number;   // e.g. 24
  paymentType: 'annuity' | 'differentiated'; // аннуитетный или дифференцированный
  earlyPaymentMonthly?: number; // досрочное погашение ежемесячно
}

export interface AmortizationMonth {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  firstMonthPayment?: number;
  lastMonthPayment?: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
  dtiRatio: number; // Debt to Income %
  dtiStatus: 'optimal' | 'moderate' | 'critical';
  schedule: AmortizationMonth[];
  savingsWithEarlyRepayment?: {
    monthsSaved: number;
    interestSaved: number;
  };
}
