const SummaryCards = ({ totals, mealBreakdown }) => {
  const highlightMetrics = [
    { label: 'Калории', value: totals.calories, unit: 'ккал' },
    { label: 'Белки', value: totals.protein, unit: 'г' },
    { label: 'Жиры', value: totals.fat, unit: 'г' },
    { label: 'Углеводы', value: totals.carbs, unit: 'г' }
  ];

  return (
    <section className="mx-auto mt-16 max-w-6xl px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h3 className="text-2xl font-semibold">Сводка за день</h3>
        <p className="text-slate-600 dark:text-slate-300">
          Полная картина твоего рациона с акцентом на ключевые показатели. Следи за балансом БЖУ и контролируй калорийность.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {highlightMetrics.map((item) => (
          <div key={item.label} className="glass-card flex flex-col gap-2">
            <span className="text-sm uppercase tracking-wide text-primary">{item.label}</span>
            <span className="text-3xl font-semibold">{item.value.toFixed(1)}</span>
            <span className="text-sm text-slate-500 dark:text-slate-300">{item.unit}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {mealBreakdown.map((meal) => (
          <div key={meal.meal} className="glass-card">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold">{meal.meal}</h4>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {meal.calories.toFixed(0)} ккал
              </span>
            </div>
            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-300">
              <p>Белки: <span className="font-semibold text-slate-900 dark:text-white">{meal.protein.toFixed(1)} г</span></p>
              <p>Жиры: <span className="font-semibold text-slate-900 dark:text-white">{meal.fat.toFixed(1)} г</span></p>
              <p>Углеводы: <span className="font-semibold text-slate-900 dark:text-white">{meal.carbs.toFixed(1)} г</span></p>
              <p>Клетчатка: <span className="font-semibold text-slate-900 dark:text-white">{meal.fiber.toFixed(1)} г</span></p>
              <p>Сахара: <span className="font-semibold text-slate-900 dark:text-white">{meal.sugar.toFixed(1)} г</span></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SummaryCards;
