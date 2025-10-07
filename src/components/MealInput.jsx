import { useMemo, useState } from 'react';
import { foodDatabase } from '../data/foods';

const mealTypes = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

const MealInput = ({ entries, onAddEntry, onRemoveEntry, onCalculate }) => {
  const [form, setForm] = useState({ food: '', quantity: 100, meal: mealTypes[0] });
  const [error, setError] = useState('');

  const filteredFoods = useMemo(() => {
    if (!form.food) return foodDatabase;
    return foodDatabase.filter((item) => item.name.toLowerCase().includes(form.food.toLowerCase()));
  }, [form.food]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const food = foodDatabase.find((item) => item.name.toLowerCase() === form.food.toLowerCase());

    if (!food) {
      setError('Выбери продукт из списка базы данных.');
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError('Количество должно быть больше нуля.');
      return;
    }

    onAddEntry({ ...food, meal: form.meal, quantity: Number(form.quantity) });
    setForm((prev) => ({ ...prev, food: '', quantity: 100 }));
    setError('');
  };

  return (
    <section id="calculator" className="relative z-10 mx-auto mt-12 max-w-6xl px-6">
      <div className="mb-10 flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Конструктор рациона</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Добавляй продукты, указывай массу и собирай полный рацион на день. Наша база данных содержит популярные продукты и рассчитана на 100 г веса.
        </p>
      </div>

      <div className="glass-card mb-8">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Продукт</label>
            <input
              type="text"
              list="food-options"
              value={form.food}
              onChange={(event) => setForm((prev) => ({ ...prev, food: event.target.value }))}
              placeholder="Например, Овсянка"
              className="w-full rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/60"
            />
            <datalist id="food-options">
              {filteredFoods.map((food) => (
                <option key={food.name} value={food.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Количество (г)</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              className="w-full rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Приём пищи</label>
            <select
              value={form.meal}
              onChange={(event) => setForm((prev) => ({ ...prev, meal: event.target.value }))}
              className="w-full rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/60"
            >
              {mealTypes.map((meal) => (
                <option key={meal}>{meal}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center gap-4">
            <button type="submit" className="neon-button bg-gradient-to-r from-primary to-accent text-white">
              Добавить продукт
            </button>
            <button type="button" onClick={onCalculate} className="neon-button bg-white/90 text-primary dark:bg-slate-900/70 dark:text-white">
              Подсчитать
            </button>
            {error && <p className="text-sm text-rose-500">{error}</p>}
          </div>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {entries.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-slate-500 dark:border-primary/30 dark:bg-primary/10">
            Пока список пуст. Добавь продукты и составь свой идеальный рацион на день.
          </p>
        ) : (
          entries.map((entry, index) => (
            <div key={`${entry.name}-${index}`} className="glass-card fade-in flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{entry.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {entry.meal} · {entry.quantity} г
                  </p>
                </div>
                <button
                  className="text-sm text-rose-500 transition hover:text-rose-400"
                  onClick={() => onRemoveEntry(index)}
                >
                  Удалить
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <p>Калории: <span className="font-semibold">{entry.caloriesPerPortion.toFixed(1)}</span></p>
                <p>Белки: <span className="font-semibold">{entry.proteinPerPortion.toFixed(1)} г</span></p>
                <p>Жиры: <span className="font-semibold">{entry.fatPerPortion.toFixed(1)} г</span></p>
                <p>Углеводы: <span className="font-semibold">{entry.carbsPerPortion.toFixed(1)} г</span></p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default MealInput;
