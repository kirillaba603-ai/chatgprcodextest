const AIAssistant = ({ analysis, onGenerateMenu, suggestedMenu }) => {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-6">
      <div className="glass-card grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-2xl font-semibold">ИИ-помощник</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Наш интеллект оценивает баланс БЖУ, калории, клетчатку и сахар. Получай рекомендации и пример меню, чтобы оставаться в форме без стресса.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-200">
            {analysis.map((item, index) => (
              <li key={index} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-3">
                <span className="mt-0.5 text-lg">{item.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/20 p-6">
          <div>
            <h4 className="text-lg font-semibold">Нужно вдохновение?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-200">
              Сгенерируй пример сбалансированного меню на день с упором на цели: энергия, стройность или набор массы.
            </p>
          </div>
          <button onClick={onGenerateMenu} className="neon-button self-start bg-white/90 text-primary dark:bg-slate-900/70 dark:text-white">
            Предложить меню
          </button>
          {suggestedMenu && (
            <div className="rounded-2xl bg-white/70 p-4 text-sm shadow-inner dark:bg-slate-900/60">
              <h5 className="mb-2 font-semibold">Пример дня</h5>
              <ul className="space-y-2 text-slate-600 dark:text-slate-200">
                {suggestedMenu.map((item, index) => (
                  <li key={index}>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.meal}: </span>
                    {item.items.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
