import { useEffect } from 'react';

const scrollToCalculator = () => {
  const section = document.getElementById('calculator');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

const Header = ({ onToggleTheme, theme, isAuthenticated, onAuth }) => {
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            AI Calories · питание в твоих руках
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Подсчёт калорий с интеллектом, который понимает твой день
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Собирай дневной рацион, анализируй БЖУ и получай советы от ИИ-помощника. Современный подход к питанию для тех, кто ценит здоровье и время.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToCalculator}
              className="neon-button bg-gradient-to-r from-primary to-accent text-white shadow-neon"
            >
              Начать
            </button>
            <button
              onClick={onAuth}
              className="neon-button bg-white/80 text-primary shadow-glow dark:bg-slate-900/60 dark:text-white"
            >
              {isAuthenticated ? 'Профиль' : 'Войти через Google / гость'}
            </button>
            <button
              onClick={onToggleTheme}
              className="neon-button bg-transparent text-slate-700 dark:text-slate-100"
            >
              {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            </button>
          </div>
        </div>
        <div className="relative mx-auto max-w-md">
          <div className="glass-card flex flex-col gap-4">
            <h2 className="text-xl font-semibold">ИИ подсказки в реальном времени</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Вводи продукты, следи за прогрессом и получай рекомендации по улучшению рациона без труда.
            </p>
            <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-primary dark:bg-slate-950 dark:text-accent">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">AI Calories понимает твои цели</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Персональные советы по питанию за секунды.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
