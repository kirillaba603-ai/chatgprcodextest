const detectors = [
  {
    name: 'Куриная грудка',
    keywords: ['куриц', 'chicken', 'breast', 'fillet'],
    quantity: 180,
    suggestedMeal: 'Обед'
  },
  {
    name: 'Овсянка',
    keywords: ['овся', 'oat', 'porridge'],
    quantity: 60,
    suggestedMeal: 'Завтрак'
  },
  {
    name: 'Яйцо куриное',
    keywords: ['яйц', 'egg'],
    quantity: 55,
    suggestedMeal: 'Завтрак'
  },
  {
    name: 'Гречка',
    keywords: ['греч', 'buckwheat'],
    quantity: 130,
    suggestedMeal: 'Ужин'
  },
  {
    name: 'Лосось',
    keywords: ['лосос', 'salmon', 'fish'],
    quantity: 170,
    suggestedMeal: 'Ужин'
  },
  {
    name: 'Авокадо',
    keywords: ['авокад', 'avocado'],
    quantity: 100,
    suggestedMeal: 'Перекус'
  },
  {
    name: 'Яблоко',
    keywords: ['ябл', 'apple'],
    quantity: 150,
    suggestedMeal: 'Перекус'
  },
  {
    name: 'Банан',
    keywords: ['банан', 'banana'],
    quantity: 120,
    suggestedMeal: 'Перекус'
  },
  {
    name: 'Творог 5%',
    keywords: ['творог', 'curd', 'cottage'],
    quantity: 160,
    suggestedMeal: 'Перекус'
  },
  {
    name: 'Шпинат',
    keywords: ['шпинат', 'spinach'],
    quantity: 90,
    suggestedMeal: 'Обед'
  },
  {
    name: 'Коричневый рис',
    keywords: ['рис', 'rice'],
    quantity: 160,
    suggestedMeal: 'Обед'
  },
  {
    name: 'Тунец консервированный',
    keywords: ['тунец', 'tuna'],
    quantity: 150,
    suggestedMeal: 'Обед'
  },
  {
    name: 'Греческий йогурт',
    keywords: ['йогурт', 'yogurt', 'greek'],
    quantity: 140,
    suggestedMeal: 'Завтрак'
  },
  {
    name: 'Миндаль',
    keywords: ['миндал', 'almond'],
    quantity: 30,
    suggestedMeal: 'Перекус'
  },
  {
    name: 'Киноа',
    keywords: ['киноа', 'quinoa'],
    quantity: 140,
    suggestedMeal: 'Обед'
  },
  {
    name: 'Брокколи',
    keywords: ['брокк', 'broccoli'],
    quantity: 110,
    suggestedMeal: 'Ужин'
  },
  {
    name: 'Зелёный смузи',
    keywords: ['смузи', 'smoothie'],
    quantity: 260,
    suggestedMeal: 'Перекус'
  }
];

const combineText = (filename = '', hints = '', labels = []) => {
  const items = [filename, hints, ...(Array.isArray(labels) ? labels : [])].filter(Boolean);
  if (items.length === 0) {
    return '';
  }
  return items
    .join(' ')
    .toLowerCase()
    .replace(/[._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const applyQuantityAdjustments = (baseQuantity, text) => {
  let quantity = baseQuantity;
  if (!text) {
    return Math.round(quantity);
  }

  if (/(big|large|больш|extra)/.test(text)) {
    quantity *= 1.4;
  }
  if (/(double|двойн)/.test(text)) {
    quantity *= 1.8;
  }
  if (/(mini|small|малень|mini)/.test(text)) {
    quantity *= 0.75;
  }
  if (/(family|семейн)/.test(text)) {
    quantity *= 2.2;
  }

  return Math.round(quantity);
};

const calculateConfidence = (matchesCount, totalWords) => {
  const base = 0.55 + Math.min(matchesCount, 3) * 0.1;
  const lengthPenalty = totalWords > 12 ? 0.05 : 0;
  return Number(Math.min(base - lengthPenalty, 0.95).toFixed(2));
};

export const analyzeFoodPhoto = ({ filename = '', hints = '', labels = [] } = {}) => {
  const text = combineText(filename, hints, labels);
  if (!text) {
    return [];
  }

  const tokens = text.split(' ');
  const detections = new Map();

  detectors.forEach((detector) => {
    const matches = detector.keywords.filter((keyword) => text.includes(keyword));
    if (matches.length > 0) {
      const adjustedQuantity = applyQuantityAdjustments(detector.quantity, text);
      const confidence = calculateConfidence(matches.length, tokens.length);
      const existing = detections.get(detector.name);

      if (!existing || confidence > existing.confidence) {
        detections.set(detector.name, {
          name: detector.name,
          quantity: adjustedQuantity,
          confidence,
          suggestedMeal: detector.suggestedMeal
        });
      }
    }
  });

  if (!detections.size) {
    if (/салат|salad/.test(text)) {
      detections.set('Шпинат', {
        name: 'Шпинат',
        quantity: applyQuantityAdjustments(120, text),
        confidence: 0.62,
        suggestedMeal: 'Обед'
      });
    }
    if (/смузи|smoothie/.test(text)) {
      detections.set('Зелёный смузи', {
        name: 'Зелёный смузи',
        quantity: applyQuantityAdjustments(260, text),
        confidence: 0.65,
        suggestedMeal: 'Перекус'
      });
    }
  }

  return Array.from(detections.values());
};

export const __internal = {
  combineText,
  applyQuantityAdjustments,
  calculateConfidence
};
