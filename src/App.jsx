import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import MealInput from './components/MealInput.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import AIAssistant from './components/AIAssistant.jsx';
import Footer from './components/Footer.jsx';

const baseTotals = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  sugar: 0
};

const suggestionTemplates = [
  {
    meal: 'Завтрак',
    items: ['Овсянка с ягодами', 'Греческий йогурт', 'Зелёный чай']
  },
  {
    meal: 'Перекус',
    items: ['Яблоко', 'Горсть миндаля']
  },
  {
    meal: 'Обед',
    items: ['Куриная грудка на гриле', 'Киноа', 'Салат из шпината']
  },
  {
    meal: 'Полдник',
    items: ['Творог с ягодами', 'Чай матча']
  },
  {
    meal: 'Ужин',
    items: ['Лосось на пару', 'Авокадо', 'Овощи на пару']
  }
];

const App = () => {
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState(baseTotals);
  const [analysis, setAnalysis] = useState([
    {
      icon: '✨',
      title: 'Добавь продукты и нажми «Подсчитать»',
      description: 'ИИ проанализирует твой рацион и подскажет, как сделать его ещё лучше.'
    }
  ]);
  const [suggestedMenu, setSuggestedMenu] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mealBreakdown = useMemo(() => {
    const grouped = {};
    entries.forEach((entry) => {
      if (!grouped[entry.meal]) {
        grouped[entry.meal] = { ...baseTotals };
      }
      grouped[entry.meal].calories += entry.caloriesPerPortion;
      grouped[entry.meal].protein += entry.proteinPerPortion;
      grouped[entry.meal].fat += entry.fatPerPortion;
      grouped[entry.meal].carbs += entry.carbsPerPortion;
      grouped[entry.meal].fiber += entry.fiberPerPortion;
      grouped[entry.meal].sugar += entry.sugarPerPortion;
    });

    return Object.entries(grouped).map(([meal, values]) => ({ meal, ...values }));
  }, [entries]);

  const handleAddEntry = (food) => {
    const factor = food.quantity / 100;
    const entry = {
      ...food,
      caloriesPerPortion: food.calories * factor,
      proteinPerPortion: food.protein * factor,
      fatPerPortion: food.fat * factor,
      carbsPerPortion: food.carbs * factor,
      fiberPerPortion: (food.fiber || 0) * factor,
      sugarPerPortion: (food.sugar || 0) * factor
    };

    setEntries((prev) => [...prev, entry]);
  };

  const handleRemoveEntry = (index) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const generateAnalysis = (newTotals) => {
    const messages = [];
    if (newTotals.calories === 0) {
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
      description: `Общая калорийность: ${newTotals.calories.toFixed(0)} ккал. Убедись, что это соответствует твоей цели по весу.`
    });

    const proteinRatio = newTotals.protein * 4;
    const fatRatio = newTotals.fat * 9;
    const carbRatio = newTotals.carbs * 4;
    const totalMacroCalories = proteinRatio + fatRatio + carbRatio;

    if (totalMacroCalories > 0) {
      const proteinPercent = (proteinRatio / totalMacroCalories) * 100;
      const fatPercent = (fatRatio / totalMacroCalories) * 100;
      const carbPercent = (carbRatio / totalMacroCalories) * 100;

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

    if (newTotals.fiber < 20) {
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

    if (newTotals.sugar > 50) {
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

  const handleCalculate = () => {
    const newTotals = entries.reduce(
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

    setTotals(newTotals);
    setAnalysis(generateAnalysis(newTotals));
  };

  const handleGenerateMenu = () => {
    const shuffled = [...suggestionTemplates].sort(() => Math.random() - 0.5);
    setSuggestedMenu(shuffled.slice(0, 4));
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(30,167,253,0.15),transparent_55%)] opacity-80" />
      <Header
        onToggleTheme={handleToggleTheme}
        theme={theme}
        isAuthenticated={isAuthenticated}
        onAuth={handleAuth}
      />
      <main>
        <MealInput entries={entries} onAddEntry={handleAddEntry} onRemoveEntry={handleRemoveEntry} onCalculate={handleCalculate} />
        <SummaryCards totals={totals} mealBreakdown={mealBreakdown} />
        <AIAssistant analysis={analysis} onGenerateMenu={handleGenerateMenu} suggestedMenu={suggestedMenu} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
