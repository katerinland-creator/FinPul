import { ExpenseCategory, IncomeCategory } from '../types/finance';

interface KeywordRule<T> {
  category: T;
  keywords: string[];
}

const EXPENSE_RULES: KeywordRule<ExpenseCategory>[] = [
  {
    category: 'Питание и продукты',
    keywords: [
      'продукт', 'супермаркет', 'сильпо', 'атб', 'ашан', 'novus', 'ноPlatformус', 'varus', 'варус',
      'metro', 'еда', 'обед', 'ужин', 'завтрак', 'кофе', 'кофейн', 'кафе', 'ресторан',
      'пицц', 'суши', 'бургер', 'mcdonald', 'kfc', 'хлеб', 'мясо', 'молок', 'доставка еды',
      'glovo', 'bolt food', 'grocery', 'food', 'coffee', 'market', 'рынок', 'базар'
    ],
  },
  {
    category: 'Транспорт и авто',
    keywords: [
      'такси', 'uber', 'убер', 'bolt', 'болт', 'бензин', 'заправк', 'азс', 'wog', 'okko', 'окко', 'socar',
      'сокар', 'парковк', 'автомойк', 'мойка авто', 'сто', 'шиномонтаж', 'запчаст', 'авто',
      'метро', 'автобус', 'маршрутк', 'поезд', 'укрзалізниц', 'жд билет', 'билет на поезд',
      'самолет', 'авиабилет', 'проездной', 'transport', 'taxi', 'gas', 'fuel', 'car'
    ],
  },
  {
    category: 'Оборудование и ПО',
    keywords: [
      'подписк', 'софт', 'программ', 'figma', 'фигма', 'github', 'чатгпт', 'chatgpt', 'openai',
      'claude', 'adobe', 'jetbrains', 'сервер', 'хостинг', 'домен', 'облако', 'cloud', 'aws',
      'ноутбук', 'компьютер', 'монитор', 'клавиатур', 'мышь', 'наушник', 'телефон', 'iphone',
      'macbook', 'техник', 'гаджет', 'apple', 'software', 'hardware', 'subscription', 'api'
    ],
  },
  {
    category: 'Жилье и ЖКХ',
    keywords: [
      'жкх', 'коммуналк', 'квартплат', 'аренда квартир', 'аренда жилья', 'свет', 'электричеств',
      'вода', 'отопление', 'газ', 'домофон', 'интернет', 'провайдер', 'осбб', 'osbb', 'управдом',
      'ремонт квартир', 'мебель', 'икеа', 'ikea', 'эпицентр', 'rent', 'utilities', 'home'
    ],
  },
  {
    category: 'Здоровье и спорт',
    keywords: [
      'аптек', 'лекарств', 'таблетк', 'витамин', 'врач', 'доктор', 'клиник', 'больниц', 'стоматолог',
      'зуб', 'анализ', 'спорт', 'зал', 'фитнес', 'тренировк', 'абонемент', 'бассейн', 'йога',
      'массаж', 'health', 'fitness', 'gym', 'pharmacy', 'doctor', 'optic'
    ],
  },
  {
    category: 'Образование',
    keywords: [
      'курс', 'обучени', 'урок', 'школ', 'университет', 'вебинар', 'тренинг', 'лекци', 'книг',
      'учебник', 'репетитор', 'english', 'английск', 'education', 'book', 'udemy', 'coursera'
    ],
  },
  {
    category: 'Налоги и комиссии',
    keywords: [
      'налог', 'есв', 'єсв', 'единый налог', 'єдиний податок', 'податок', 'комисси', 'комиссия банк',
      'госпошлин', 'штраф', 'tax', 'fee', 'duty'
    ],
  },
  {
    category: 'Развлечения',
    keywords: [
      'кино', 'фильм', 'театр', 'концерт', 'билет в кино', 'музей', 'выставк', 'steam', 'стим',
      'игры', 'playstation', 'xbox', 'боулинг', 'бильярд', 'квест', 'бар', 'паб', 'клуб',
      'развлечени', 'party', 'cinema', 'game'
    ],
  },
];

const INCOME_RULES: KeywordRule<IncomeCategory>[] = [
  {
    category: 'Зарплата',
    keywords: ['зарплат', 'аванс', 'оклад', 'зп', 'основная работа', 'salary', 'payroll'],
  },
  {
    category: 'Фриланс и проекты',
    keywords: [
      'фриланс', 'проект', 'заказ', 'контракт', 'клиент', 'дизайн', 'верстк', 'разработк',
      'консультаци', 'upwork', 'freelance', 'client', 'project'
    ],
  },
  {
    category: 'Инвестиции и дивиденды',
    keywords: [
      'дивиденд', 'акции', 'купон', 'облигаци', 'овдп', 'брокер', 'ibkr', 'инвестици',
      'крипт', 'биткоин', 'usdt', 'binance', 'dividend', 'invest'
    ],
  },
  {
    category: 'Пассивный доход',
    keywords: ['пассивн', 'роялти', 'депозит', 'процент по вкладу', 'вклад', 'deposit', 'passive'],
  },
  {
    category: 'Аренда',
    keywords: ['арендная плат', 'сдача квартир', 'сдача жилья', 'арендаторы', 'rental income'],
  },
  {
    category: 'Премии и бонусы',
    keywords: ['преми', 'бонус', 'квартальная преми', 'годовой бонус', 'подарок', 'bonus'],
  },
  {
    category: 'Кэшбэк и проценты',
    keywords: ['кэшбэк', 'кешбек', 'cashback', 'процент на остаток', 'монобанк кешбек'],
  },
  {
    category: 'Продажи',
    keywords: ['продаж', 'olx', 'продал', 'товар', 'магазин', 'sales'],
  },
];

export function detectCategory(
  title: string,
  type: 'income' | 'expense'
): { category: string; matchedKeyword: string } | null {
  if (!title || title.trim().length < 2) return null;

  const normalized = title.toLowerCase().trim();

  if (type === 'expense') {
    for (const rule of EXPENSE_RULES) {
      for (const kw of rule.keywords) {
        if (normalized.includes(kw)) {
          return { category: rule.category, matchedKeyword: kw };
        }
      }
    }
  } else {
    for (const rule of INCOME_RULES) {
      for (const kw of rule.keywords) {
        if (normalized.includes(kw)) {
          return { category: rule.category, matchedKeyword: kw };
        }
      }
    }
  }

  return null;
}
