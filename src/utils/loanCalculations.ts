import { LoanParameters, LoanCalculationResult, AmortizationMonth } from '../types/loan';

export function calculateLoan(
  params: LoanParameters,
  totalMonthlyIncome: number
): LoanCalculationResult {
  const principal = Math.max(0, params.loanAmount - params.downPayment);
  const n = Math.max(1, params.termMonths);
  const monthlyRate = params.interestRate / 100 / 12;
  const earlyPayment = params.earlyPaymentMonthly || 0;

  const schedule: AmortizationMonth[] = [];
  let remaining = principal;
  let totalPayment = 0;
  let totalInterest = 0;

  const startDate = new Date('2026-10-01');

  if (params.paymentType === 'annuity') {
    // Annuity formula
    let baseMonthlyPayment = 0;
    if (monthlyRate === 0) {
      baseMonthlyPayment = principal / n;
    } else {
      const factor = Math.pow(1 + monthlyRate, n);
      baseMonthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
    }

    let month = 1;
    while (remaining > 0.01 && month <= n * 2) {
      const interestPart = remaining * monthlyRate;
      let principalPart = baseMonthlyPayment - interestPart + earlyPayment;

      if (principalPart > remaining) {
        principalPart = remaining;
      }

      const payment = principalPart + interestPart;
      remaining -= principalPart;
      totalPayment += payment;
      totalInterest += interestPart;

      const dateObj = new Date(startDate);
      dateObj.setMonth(dateObj.getMonth() + (month - 1));
      const dateStr = dateObj.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

      schedule.push({
        month,
        date: dateStr,
        payment,
        principal: principalPart,
        interest: interestPart,
        remainingBalance: Math.max(0, remaining),
      });

      month++;
      if (remaining <= 0.01) break;
    }

    // Baseline without early payment for comparison
    let baselineTotalInterest = 0;
    let baselineMonths = n;
    if (earlyPayment > 0) {
      let bRemaining = principal;
      for (let m = 1; m <= n; m++) {
        const bInterest = bRemaining * monthlyRate;
        const bPrincipal = baseMonthlyPayment - bInterest;
        baselineTotalInterest += bInterest;
        bRemaining -= bPrincipal;
      }
    }

    const dtiRatio = totalMonthlyIncome > 0 ? (baseMonthlyPayment / totalMonthlyIncome) * 100 : 0;
    const dtiStatus: 'optimal' | 'moderate' | 'critical' =
      dtiRatio <= 35 ? 'optimal' : dtiRatio <= 50 ? 'moderate' : 'critical';

    return {
      monthlyPayment: baseMonthlyPayment,
      totalPayment,
      totalInterest,
      effectiveRate: principal > 0 ? (totalInterest / principal) * 100 : 0,
      dtiRatio,
      dtiStatus,
      schedule,
      savingsWithEarlyRepayment:
        earlyPayment > 0
          ? {
              monthsSaved: Math.max(0, baselineMonths - schedule.length),
              interestSaved: Math.max(0, baselineTotalInterest - totalInterest),
            }
          : undefined,
    };
  } else {
    // Differentiated formula
    const fixedPrincipalPart = principal / n;
    let firstMonthPayment = 0;
    let lastMonthPayment = 0;

    for (let month = 1; month <= n; month++) {
      const interestPart = remaining * monthlyRate;
      let principalPart = fixedPrincipalPart + earlyPayment;
      if (principalPart > remaining) {
        principalPart = remaining;
      }

      const payment = principalPart + interestPart;
      if (month === 1) firstMonthPayment = payment;
      lastMonthPayment = payment;

      remaining -= principalPart;
      totalPayment += payment;
      totalInterest += interestPart;

      const dateObj = new Date(startDate);
      dateObj.setMonth(dateObj.getMonth() + (month - 1));
      const dateStr = dateObj.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });

      schedule.push({
        month,
        date: dateStr,
        payment,
        principal: principalPart,
        interest: interestPart,
        remainingBalance: Math.max(0, remaining),
      });

      if (remaining <= 0.01) break;
    }

    const avgPayment = totalPayment / schedule.length;
    const dtiRatio = totalMonthlyIncome > 0 ? (firstMonthPayment / totalMonthlyIncome) * 100 : 0;
    const dtiStatus: 'optimal' | 'moderate' | 'critical' =
      dtiRatio <= 35 ? 'optimal' : dtiRatio <= 50 ? 'moderate' : 'critical';

    return {
      monthlyPayment: avgPayment,
      firstMonthPayment,
      lastMonthPayment,
      totalPayment,
      totalInterest,
      effectiveRate: principal > 0 ? (totalInterest / principal) * 100 : 0,
      dtiRatio,
      dtiStatus,
      schedule,
    };
  }
}
