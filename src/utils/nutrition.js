export const baseTotals = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  sugar: 0
};

export const scaleFoodEntry = (food, quantity) => {
  const factor = quantity / 100;
  return {
    caloriesPerPortion: food.calories * factor,
    proteinPerPortion: food.protein * factor,
    fatPerPortion: food.fat * factor,
    carbsPerPortion: food.carbs * factor,
    fiberPerPortion: (food.fiber || 0) * factor,
    sugarPerPortion: (food.sugar || 0) * factor
  };
};

export const calculateTotals = (entries) =>
  entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.caloriesPerPortion,
      protein: acc.protein + entry.proteinPerPortion,
      fat: acc.fat + entry.fatPerPortion,
      carbs: acc.carbs + entry.carbsPerPortion,
      fiber: acc.fiber + entry.fiberPerPortion,
      sugar: acc.sugar + entry.sugarPerPortion
    }),
    { ...baseTotals }
  );

export const analyzeNutrition = (totals) => {
  const messages = [];

  if (totals.calories === 0) {
    messages.push({
      icon: '✨',
      title: 'Добавь продукты и нажми «Подсчитать»',
      description: 'ИИ проанализирует твой рацион и подскажет, как сделать его ещё лучше.'
    });
    return messages;
  }

  messages.push({
    icon: '📊',
    title: 'Баланс калорий',
    description: `Общая калорийность: ${totals.calories.toFixed(0)} ккал. Убедись, что это соответствует твоей цели по весу.`
  });

  const proteinCalories = totals.protein * 4;
  const fatCalories = totals.fat * 9;
  const carbCalories = totals.carbs * 4;
  const totalMacroCalories = proteinCalories + fatCalories + carbCalories;

  if (totalMacroCalories > 0) {
    const proteinPercent = (proteinCalories / totalMacroCalories) * 100;
    const fatPercent = (fatCalories / totalMacroCalories) * 100;
    const carbPercent = (carbCalories / totalMacroCalories) * 100;

    if (proteinPercent < 20) {
      messages.push({
        icon: '💪',
        title: 'Добавь больше белка',
        description: 'Белки помогают восстанавливаться после тренировок и поддерживают чувство насыщения. Попробуй включить курицу, яйца или бобовые.'
      });
    } else {
      messages.push({
        icon: '✅',
        title: 'Баланс белка на уровне',
        description: 'Доля белка выглядит отлично. Продолжай держать фокус на качественных источниках.'
      });
    }

    if (fatPercent > 35) {
      messages.push({
        icon: '🥑',
        title: 'Контроль жиров',
        description: 'Жиры важны, но лучше выбирать полезные источники: авокадо, рыба, орехи. Попробуй уменьшить жареные блюда.'
      });
    }

    if (carbPercent > 55) {
      messages.push({
        icon: '🍬',
        title: 'Слишком много сахара?',
        description: 'Похоже, углеводы преобладают. Сделай акцент на сложных углеводах и клетчатке, чтобы держать уровень энергии стабильным.'
      });
    }
  }

  if (totals.fiber < 20) {
    messages.push({
      icon: '🥦',
      title: 'Добавь клетчатку',
      description: 'Цель — 25–30 г клетчатки в день. Включи больше овощей, ягод и цельнозерновых продуктов.'
    });
  } else {
    messages.push({
      icon: '🌿',
      title: 'Отличная клетчатка',
      description: 'Твой рацион богат клетчаткой — это поддерживает здоровье ЖКТ и сытость.'
    });
  }

  if (totals.sugar > 50) {
    messages.push({
      icon: '⚠️',
      title: 'Сахара выше нормы',
      description: 'Старайся ограничить добавленный сахар до 25–50 г в день. Добавь больше цельных продуктов и избегай сладких напитков.'
    });
  }

  if (messages.length < 4) {
    messages.push({
      icon: '🔥',
      title: 'Курс на энергию',
      description: 'Рацион выглядит сбалансированно. Можно слегка скорректировать порции в зависимости от активности.'
    });
  }

  return messages;
};
