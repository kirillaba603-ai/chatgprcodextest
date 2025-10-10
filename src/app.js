import { foodDatabase } from './data/foods.js';
import { analyzeNutrition, baseTotals, calculateTotals, scaleFoodEntry } from './utils/nutrition.js';
import { analyzeFoodPhoto } from './utils/photo.js';

const state = {
  entries: [],
  totals: { ...baseTotals },
  analysis: analyzeNutrition(baseTotals),
  suggestedMenu: [],
  authStatus: 'guest',
  theme: 'light',
  photo: {
    previewUrl: '',
    status: 'Загрузи фото, чтобы увидеть результаты.',
    statusTone: 'info',
    detections: [],
    hints: '',
    meta: null
  }
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

const foodInput = document.getElementById('food-input');
const quantityInput = document.getElementById('quantity-input');
const mealSelect = document.getElementById('meal-select');
const mealForm = document.getElementById('meal-form');
const foodOptions = document.getElementById('food-options');
const entriesList = document.getElementById('entries-list');
const errorMessage = document.getElementById('form-error');
const totalsView = {
  calories: document.getElementById('total-calories'),
  protein: document.getElementById('total-protein'),
  fat: document.getElementById('total-fat'),
  carbs: document.getElementById('total-carbs')
};
const mealBreakdownContainer = document.getElementById('meal-breakdown');
const analysisContainer = document.getElementById('analysis-cards');
const suggestedMenuContainer = document.getElementById('suggested-menu');
const calculateButton = document.getElementById('calculate-button');
const generateMenuButton = document.getElementById('generate-menu');
const generateMenuCta = document.getElementById('generate-menu-cta');
const themeToggle = document.getElementById('theme-toggle');
const authGoogleButton = document.getElementById('auth-google');
const authGuestButton = document.getElementById('auth-guest');
const authStatusLabel = document.getElementById('auth-status');
const photoInput = document.getElementById('photo-input');
const photoDropzone = document.getElementById('photo-dropzone');
const photoStatus = document.getElementById('photo-status');
const photoResults = document.getElementById('photo-results');
const photoHints = document.getElementById('photo-hints');
const photoPreviewWrapper = document.getElementById('photo-preview-wrapper');
const photoPreview = document.getElementById('photo-preview');
const photoName = document.getElementById('photo-name');
const photoResetButton = document.getElementById('photo-reset');

const renderFoodOptions = (filter = '') => {
  const query = filter.trim().toLowerCase();
  const results = query
    ? foodDatabase.filter((item) => item.name.toLowerCase().includes(query))
    : foodDatabase;

  foodOptions.innerHTML = results
    .slice(0, 25)
    .map((item) => `<option value="${item.name}"></option>`)
    .join('');
};

const renderEntries = () => {
  if (state.entries.length === 0) {
    entriesList.innerHTML = `
      <p class="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-slate-500 dark:border-primary/30 dark:bg-primary/10">
        Пока список пуст. Добавь продукты и составь свой идеальный рацион на день.
      </p>
    `;
    return;
  }

  const cards = state.entries
    .map(
      (entry, index) => `
        <div class="glass-card fade-in flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-semibold">${entry.name}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">${entry.meal} · ${entry.quantity} г</p>
            </div>
            <button class="text-sm text-rose-500 transition hover:text-rose-400" data-remove-index="${index}">
              Удалить
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <p>Калории: <span class="font-semibold">${entry.caloriesPerPortion.toFixed(1)}</span></p>
            <p>Белки: <span class="font-semibold">${entry.proteinPerPortion.toFixed(1)} г</span></p>
            <p>Жиры: <span class="font-semibold">${entry.fatPerPortion.toFixed(1)} г</span></p>
            <p>Углеводы: <span class="font-semibold">${entry.carbsPerPortion.toFixed(1)} г</span></p>
          </div>
        </div>
      `
    )
    .join('');

  entriesList.innerHTML = cards;

  entriesList.querySelectorAll('[data-remove-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.removeIndex);
      state.entries.splice(index, 1);
      renderEntries();
      renderMealBreakdown();
    });
  });
};

const renderTotals = () => {
  totalsView.calories.textContent = state.totals.calories.toFixed(0);
  totalsView.protein.textContent = `${state.totals.protein.toFixed(1)} г`;
  totalsView.fat.textContent = `${state.totals.fat.toFixed(1)} г`;
  totalsView.carbs.textContent = `${state.totals.carbs.toFixed(1)} г`;
};

const renderMealBreakdown = () => {
  if (state.entries.length === 0) {
    mealBreakdownContainer.innerHTML = `<p class="text-sm text-slate-500 dark:text-slate-300">Добавь продукты, чтобы увидеть детализацию по приёмам пищи.</p>`;
    return;
  }

  const grouped = {};
  state.entries.forEach((entry) => {
    if (!grouped[entry.meal]) {
      grouped[entry.meal] = { ...baseTotals };
    }
    grouped[entry.meal].calories += entry.caloriesPerPortion;
    grouped[entry.meal].protein += entry.proteinPerPortion;
    grouped[entry.meal].fat += entry.fatPerPortion;
    grouped[entry.meal].carbs += entry.carbsPerPortion;
  });

  mealBreakdownContainer.innerHTML = Object.entries(grouped)
    .map(
      ([meal, values]) => `
        <div class="glass-card">
          <p class="text-sm uppercase tracking-wide text-primary">${meal}</p>
          <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
            <p>Калории: <span class="font-semibold">${values.calories.toFixed(0)}</span></p>
            <p>Белки: <span class="font-semibold">${values.protein.toFixed(1)} г</span></p>
            <p>Жиры: <span class="font-semibold">${values.fat.toFixed(1)} г</span></p>
            <p>Углеводы: <span class="font-semibold">${values.carbs.toFixed(1)} г</span></p>
          </div>
        </div>
      `
    )
    .join('');
};

const renderAnalysis = () => {
  analysisContainer.innerHTML = state.analysis
    .map(
      (item) => `
        <div class="rounded-3xl border border-primary/10 bg-white/70 p-4 shadow-sm dark:border-primary/20 dark:bg-slate-900/60">
          <div class="flex items-start gap-3">
            <span class="text-2xl">${item.icon}</span>
            <div>
              <p class="text-lg font-semibold">${item.title}</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">${item.description}</p>
            </div>
          </div>
        </div>
      `
    )
    .join('');
};

const renderSuggestedMenu = () => {
  if (!state.suggestedMenu || state.suggestedMenu.length === 0) {
    suggestedMenuContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-300">Нажми, чтобы получить свежие идеи меню.</p>';
    return;
  }

  suggestedMenuContainer.innerHTML = state.suggestedMenu
    .map(
      (item) => `
        <div class="rounded-2xl bg-white/70 p-3 text-sm shadow-sm dark:bg-slate-900/60">
          <p class="font-semibold">${item.meal}</p>
          <p class="mt-1 text-slate-600 dark:text-slate-300">${item.items.join(' · ')}</p>
        </div>
      `
    )
    .join('');
};

const renderPhotoStatus = () => {
  photoStatus.textContent = state.photo.status;
  photoStatus.className = 'text-sm transition-colors duration-300';
  if (state.photo.statusTone === 'success') {
    photoStatus.classList.add('text-primary', 'dark:text-primary');
  } else if (state.photo.statusTone === 'error') {
    photoStatus.classList.add('text-rose-500', 'dark:text-rose-400');
  } else {
    photoStatus.classList.add('text-slate-600', 'dark:text-slate-300');
  }
};

const renderPhotoPreview = () => {
  if (state.photo.previewUrl) {
    photoPreviewWrapper.classList.remove('hidden');
    photoPreview.src = state.photo.previewUrl;
    photoPreview.alt = state.photo.meta?.filename || 'Фото блюда';
    photoName.textContent = state.photo.meta?.filename || 'Загруженное фото';
    photoResetButton.classList.remove('hidden');
  } else {
    photoPreviewWrapper.classList.add('hidden');
    photoPreview.src = '';
    photoName.textContent = '';
    photoResetButton.classList.add('hidden');
  }
};

const mapDetectionToCard = (detection, index) => {
  const food = foodDatabase.find((item) => item.name === detection.name);
  let macroMarkup = '';

  if (food) {
    const macros = scaleFoodEntry(food, detection.quantity);
    macroMarkup = `
      <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
        <p>Калории: <span class="font-semibold">${macros.caloriesPerPortion.toFixed(0)}</span></p>
        <p>Белки: <span class="font-semibold">${macros.proteinPerPortion.toFixed(1)} г</span></p>
        <p>Жиры: <span class="font-semibold">${macros.fatPerPortion.toFixed(1)} г</span></p>
        <p>Углеводы: <span class="font-semibold">${macros.carbsPerPortion.toFixed(1)} г</span></p>
      </div>
    `;
  } else {
    macroMarkup = `<p class="mt-3 text-sm text-rose-500">Продукт не найден в базе. Добавь его вручную.</p>`;
  }

  const confidence = Math.round(detection.confidence * 100);
  const mealOptions = ['Завтрак', 'Обед', 'Ужин', 'Перекус']
    .map((meal) => `<option ${meal === detection.suggestedMeal ? 'selected' : ''}>${meal}</option>`)
    .join('');

  return `
    <div class="rounded-3xl border border-primary/20 bg-white/75 p-4 shadow-sm dark:border-primary/30 dark:bg-slate-900/60" data-detection="${index}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold">${detection.name}</p>
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">~${detection.quantity} г · уверенность ${confidence}%</p>
        </div>
        <button class="text-sm text-rose-500 transition hover:text-rose-400" data-remove-detection="${index}">Убрать</button>
      </div>
      ${macroMarkup}
      <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 md:w-1/2">
          <span>Приём пищи</span>
          <select data-detection-meal="${index}" class="rounded-2xl border border-transparent bg-white/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-900/60">
            ${mealOptions}
          </select>
        </label>
        <button data-add-detection="${index}" class="neon-button w-full bg-gradient-to-r from-primary to-accent text-white md:w-auto">
          Добавить в рацион
        </button>
      </div>
    </div>
  `;
};

const renderPhotoResults = () => {
  if (!state.photo.previewUrl) {
    photoResults.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-300">Загрузи фото, чтобы увидеть распознанные продукты.</p>';
    return;
  }

  if (!state.photo.detections.length) {
    photoResults.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-300">ИИ пока не распознал продукты. Добавь подсказки или выбери другое фото.</p>';
    return;
  }

  photoResults.innerHTML = state.photo.detections.map(mapDetectionToCard).join('');

  state.photo.detections.forEach((detection, index) => {
    const addButton = photoResults.querySelector(`[data-add-detection="${index}"]`);
    const removeButton = photoResults.querySelector(`[data-remove-detection="${index}"]`);
    const mealSelectElement = photoResults.querySelector(`[data-detection-meal="${index}"]`);

    if (mealSelectElement && detection.suggestedMeal) {
      mealSelectElement.value = detection.suggestedMeal;
    }

    if (addButton) {
      addButton.addEventListener('click', () => handleAddDetection(index));
    }

    if (removeButton) {
      removeButton.addEventListener('click', () => {
        state.photo.detections.splice(index, 1);
        renderPhotoResults();
        if (state.photo.detections.length === 0) {
          setPhotoStatus('Список очищен. Загрузите новое фото или обновите подсказки.', 'info');
        }
        return;
      });
    }
  });
};

const setPhotoStatus = (message, tone = 'info') => {
  state.photo.status = message;
  state.photo.statusTone = tone;
  renderPhotoStatus();
};

const runPhotoAnalysis = () => {
  if (!state.photo.meta) {
    return;
  }

  const detections = analyzeFoodPhoto({
    filename: state.photo.meta.filename,
    hints: state.photo.hints
  });

  state.photo.detections = detections;

  if (detections.length > 0) {
    setPhotoStatus('Мы нашли продукты на фото. Проверь данные и добавь их в рацион.', 'success');
  } else {
    setPhotoStatus('Не удалось распознать продукты. Попробуй добавить подсказки или выбрать другое фото.', 'error');
  }

  renderPhotoResults();
};

const resetPhoto = () => {
  if (state.photo.previewUrl) {
    URL.revokeObjectURL(state.photo.previewUrl);
  }

  state.photo = {
    previewUrl: '',
    status: 'Загрузи фото, чтобы увидеть результаты.',
    statusTone: 'info',
    detections: [],
    hints: '',
    meta: null
  };

  photoHints.value = '';
  photoInput.value = '';
  renderPhotoPreview();
  renderPhotoResults();
  renderPhotoStatus();
};

const handlePhotoSelection = (files) => {
  const [file] = Array.from(files || []).filter((item) => item.type.startsWith('image/'));

  if (!file) {
    setPhotoStatus('Выбери изображение в формате JPG или PNG.', 'error');
    return;
  }

  if (state.photo.previewUrl) {
    URL.revokeObjectURL(state.photo.previewUrl);
  }

  const objectUrl = URL.createObjectURL(file);
  state.photo.previewUrl = objectUrl;
  state.photo.meta = { filename: file.name, size: file.size };

  renderPhotoPreview();
  setPhotoStatus('Фото загружено. Запускаем распознавание…', 'info');
  runPhotoAnalysis();
};

const handlePhotoHintsChange = (event) => {
  state.photo.hints = event.target.value;
  if (state.photo.meta) {
    setPhotoStatus('Уточняем распознавание…', 'info');
    runPhotoAnalysis();
  }
};

const handleAddDetection = (index) => {
  const detection = state.photo.detections[index];
  if (!detection) {
    return;
  }

  const mealSelectElement = photoResults.querySelector(`[data-detection-meal="${index}"]`);
  const meal = mealSelectElement?.value || detection.suggestedMeal || mealSelect.value || 'Обед';
  const food = foodDatabase.find((item) => item.name === detection.name);

  if (!food) {
    setPhotoStatus('Не удалось сопоставить продукт с базой. Добавь его вручную.', 'error');
    return;
  }

  const entry = {
    name: food.name,
    meal,
    quantity: detection.quantity,
    ...scaleFoodEntry(food, detection.quantity)
  };

  state.entries.push(entry);
  state.photo.detections.splice(index, 1);

  renderEntries();
  renderMealBreakdown();
  renderPhotoResults();
  setPhotoStatus(`Добавлено: ${food.name} (${detection.quantity} г)`, 'success');
};

const updateAuthStatus = () => {
  if (state.authStatus === 'google') {
    authStatusLabel.textContent = 'Google: рекомендации персонализированы';
  } else {
    authStatusLabel.textContent = 'Гость: персонализация ограничена';
  }
};

const updateThemeToggleLabel = () => {
  themeToggle.textContent = state.theme === 'dark' ? '☀️ Светлая тема' : '🌙 Ночная тема';
};

const handleAddEntry = (event) => {
  event.preventDefault();
  const name = foodInput.value.trim();
  const quantity = Number(quantityInput.value);

  const food = foodDatabase.find((item) => item.name.toLowerCase() === name.toLowerCase());

  if (!food) {
    errorMessage.textContent = 'Выбери продукт из списка базы данных.';
    return;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errorMessage.textContent = 'Количество должно быть больше нуля.';
    return;
  }

  const entry = {
    name: food.name,
    meal: mealSelect.value,
    quantity,
    ...scaleFoodEntry(food, quantity)
  };

  state.entries.push(entry);
  foodInput.value = '';
  quantityInput.value = '100';
  errorMessage.textContent = '';
  renderEntries();
  renderMealBreakdown();
};

const handleCalculate = () => {
  state.totals = calculateTotals(state.entries);
  state.analysis = analyzeNutrition(state.totals);
  renderTotals();
  renderAnalysis();
};

const handleGenerateMenu = () => {
  const shuffled = [...suggestionTemplates].sort(() => Math.random() - 0.5);
  state.suggestedMenu = shuffled.slice(0, 4);
  renderSuggestedMenu();
};

const handleThemeToggle = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  updateThemeToggleLabel();
};

const handleAuth = (type) => {
  state.authStatus = type === 'google' ? 'google' : 'guest';
  updateAuthStatus();
  const message = type === 'google'
    ? 'Google аккаунт подключён. Рекомендации будут учитывать цели и историю.'
    : 'Режим гостя активирован. Сохраняем приватность без авторизации.';

  analysisContainer.insertAdjacentHTML(
    'afterbegin',
    `<div class="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-slate-700 dark:text-slate-100">
      ${message}
    </div>`
  );
};

const initialize = () => {
  renderFoodOptions();
  renderEntries();
  renderTotals();
  renderMealBreakdown();
  renderAnalysis();
  renderSuggestedMenu();
  renderPhotoStatus();
  renderPhotoPreview();
  renderPhotoResults();
  updateThemeToggleLabel();
  updateAuthStatus();
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
};

mealForm.addEventListener('submit', handleAddEntry);
foodInput.addEventListener('input', (event) => renderFoodOptions(event.target.value));
calculateButton.addEventListener('click', handleCalculate);
generateMenuButton.addEventListener('click', handleGenerateMenu);
generateMenuCta.addEventListener('click', () => {
  handleGenerateMenu();
  document.getElementById('analysis-cards').scrollIntoView({ behavior: 'smooth' });
});
themeToggle.addEventListener('click', handleThemeToggle);
authGoogleButton.addEventListener('click', () => handleAuth('google'));
authGuestButton.addEventListener('click', () => handleAuth('guest'));
photoHints.addEventListener('input', handlePhotoHintsChange);
photoInput.addEventListener('change', (event) => handlePhotoSelection(event.target.files));
photoResetButton.addEventListener('click', resetPhoto);

photoDropzone.addEventListener('click', () => photoInput.click());
photoDropzone.addEventListener('dragenter', (event) => {
  event.preventDefault();
  photoDropzone.classList.add('photo-dropzone--active');
});
photoDropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
});
photoDropzone.addEventListener('dragleave', () => {
  photoDropzone.classList.remove('photo-dropzone--active');
});
photoDropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  photoDropzone.classList.remove('photo-dropzone--active');
  handlePhotoSelection(event.dataTransfer?.files);
});

window.addEventListener('beforeunload', () => {
  if (state.photo.previewUrl) {
    URL.revokeObjectURL(state.photo.previewUrl);
  }
});

initialize();
