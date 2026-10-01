import { detectCategory } from './categoryDetector';
import { TransactionType } from '../types/finance';

export interface ParsedVoiceTransaction {
  transcript: string;
  title: string;
  amount: number | null;
  category: string | null;
  type: TransactionType;
  matchedKeyword?: string;
}

const RUSSIAN_NUMBER_WORDS: Record<string, number> = {
  'ноль': 0,
  'один': 1, 'одна': 1,
  'два': 2, 'две': 2,
  'три': 3,
  'четыре': 4,
  'пять': 5,
  'шесть': 6,
  'семь': 7,
  'восемь': 8,
  'девять': 9,
  'десять': 10,
  'одиннадцать': 11,
  'двенадцать': 12,
  'тринадцать': 13,
  'четырнадцать': 14,
  'пятнадцать': 15,
  'шестнадцать': 16,
  'семнадцать': 17,
  'восемнадцать': 18,
  'девятнадцать': 19,
  'двадцать': 20,
  'тридцать': 30,
  'сорок': 40,
  'пятьдесят': 50,
  'шестьдесят': 60,
  'семьдесят': 70,
  'восемьдесят': 80,
  'девяносто': 90,
  'сто': 100,
  'двести': 200,
  'триста': 300,
  'четыреста': 400,
  'пятьсот': 500,
  'шестьсот': 600,
  'семьсот': 700,
  'восемьсот': 800,
  'девятьсот': 900,
  'тысяча': 1000,
  'тысячи': 1000,
  'тысяч': 1000,
};

const INCOME_INDICATORS = [
  'зарплат', 'аванс', 'оклад', 'зп', 'доход', 'поступлени', 'гонорар',
  'дивиденд', 'преми', 'бонус', 'кэшбэк', 'кешбек', 'перевод от', 'заказчик'
];

export function parseVoiceInput(transcript: string): ParsedVoiceTransaction {
  const cleaned = transcript.trim();
  const lower = cleaned.toLowerCase();

  // 1. Detect transaction type
  let detectedType: TransactionType = 'expense';
  for (const ind of INCOME_INDICATORS) {
    if (lower.includes(ind)) {
      detectedType = 'income';
      break;
    }
  }

  // 2. Extract numeric amount
  let detectedAmount: number | null = null;
  let remainingText = cleaned;

  // Try matching numeric digits like "1200", "250.50", "45 000"
  const digitRegex = /(\d+[\s\.,]?\d*)\s*(?:грн|гривен|гривны|гривня|рублей|руб|долларов|доллар|usd|eur|евро|uah|\$|€|₴)?/i;
  const digitMatch = cleaned.match(digitRegex);

  if (digitMatch && digitMatch[1]) {
    const rawNumberStr = digitMatch[1].replace(/\s+/g, '').replace(',', '.');
    const parsedNum = parseFloat(rawNumberStr);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      detectedAmount = parsedNum;
      // Remove the matched amount and currency from title
      remainingText = cleaned.replace(digitMatch[0], '').trim();
    }
  }

  // If no digit found, try verbal words like "пятьсот", "тысяча"
  if (detectedAmount === null) {
    const words = lower.split(/\s+/);
    let total = 0;
    let current = 0;
    let foundWordNumber = false;

    for (const w of words) {
      if (RUSSIAN_NUMBER_WORDS[w] !== undefined) {
        foundWordNumber = true;
        const val = RUSSIAN_NUMBER_WORDS[w];
        if (val === 1000) {
          total += (current || 1) * 1000;
          current = 0;
        } else {
          current += val;
        }
      }
    }
    total += current;

    if (foundWordNumber && total > 0) {
      detectedAmount = total;
      // Clean word numbers from remainingText
      const numWordKeys = Object.keys(RUSSIAN_NUMBER_WORDS);
      const cleanedWords = cleaned.split(/\s+/).filter(
        (w) => !numWordKeys.includes(w.toLowerCase().replace(/[.,!]/g, ''))
      );
      remainingText = cleanedWords.join(' ');
    }
  }

  // Clean trailing punctuation and currency words from remaining text
  remainingText = remainingText
    .replace(/(?:грн|гривен|гривны|гривня|рублей|руб|долларов|доллар|usd|eur|евро|uah|\$|€|₴)/gi, '')
    .replace(/^[,.\s\-—]+|[,.\s\-—]+$/g, '')
    .trim();

  // If remainingText is empty, fall back to default or capitalize
  let finalTitle = remainingText;
  if (!finalTitle && detectedAmount) {
    finalTitle = detectedType === 'income' ? 'Поступление средств' : 'Расход';
  } else if (finalTitle) {
    finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);
  }

  // 3. Auto-detect category
  let detectedCategory: string | null = null;
  let matchedKeyword: string | undefined = undefined;

  const catResult = detectCategory(cleaned, detectedType);
  if (catResult) {
    detectedCategory = catResult.category;
    matchedKeyword = catResult.matchedKeyword;
  } else {
    // Try on remainingText
    const catResult2 = detectCategory(remainingText, detectedType);
    if (catResult2) {
      detectedCategory = catResult2.category;
      matchedKeyword = catResult2.matchedKeyword;
    }
  }

  return {
    transcript: cleaned,
    title: finalTitle || cleaned,
    amount: detectedAmount,
    category: detectedCategory,
    type: detectedType,
    matchedKeyword,
  };
}
