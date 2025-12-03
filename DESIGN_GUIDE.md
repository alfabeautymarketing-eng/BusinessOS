# Руководство по дизайну BusinessOS - iOS стиль

## Цветовая палитра

### Основные цвета (Пастельные)
```css
--primary: #B8C5F2        /* 💜 Мягкий лавандовый */
--primary-hover: #A4B4E8  /* 💙 Лаванда при наведении */
--secondary: #E8D5F2      /* 🦄 Нежная сирень */
--accent: #F2D5E5         /* 💗 Пастельный розовый */
--success: #C5E8D5        /* 🌿 Мятный */
--warning: #F9E5C8        /* 🍑 Персиковый */
--info: #D5E8F9           /* ☁️ Небесно-голубой */
```

### Нейтральные цвета
```css
--background: #F5F7FA     /* Светлый серо-голубой фон */
--surface: #FFFFFF        /* Белая поверхность */
--text-primary: #2E3A4D   /* Темно-синий для текста */
--text-secondary: #6B7A8F /* Серо-синий для вторичного текста */
```

---

## Готовые компоненты

### 1. Кнопки

#### Базовая кнопка
```jsx
<button className="button-rounded btn-primary">
  ✨ Основная кнопка
</button>
```

#### Вторичная кнопка
```jsx
<button className="button-rounded btn-secondary">
  💫 Вторичная кнопка
</button>
```

#### Кнопка успеха
```jsx
<button className="button-rounded btn-success">
  ✅ Сохранить
</button>
```

#### Пример в компоненте:
```jsx
// TopNav.tsx - обновление кнопки
<button className="button-rounded btn-primary">
  <span className="text-base">🚀</span>
  <span>Запустить</span>
</button>
```

---

### 2. Карточки с эффектом стекла

**Важно**: Существует два типа карточек:

#### `card-glass` - Для интерактивных элементов с hover-эффектом
Используйте для:
- Кнопок
- Маленьких элементов
- Элементов, которые должны реагировать на наведение

```jsx
<div className="card-glass p-6 cursor-pointer">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-full" style={{ background: 'var(--primary)' }}>
      <span className="text-2xl">💼</span>
    </div>
    <div>
      <h4 className="font-semibold">Бизнес-проект</h4>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Активен</p>
    </div>
  </div>
</div>
```

#### `card-static` - Для больших панелей без hover-эффекта
Используйте для:
- Больших панелей (Shell header, sidebar, main)
- Контейнеров
- Элементов без hover-эффектов

```jsx
<div className="card-static p-6">
  <h3 className="text-lg font-semibold mb-2">📊 Заголовок панели</h3>
  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
    Содержимое большой панели без эффекта подъема при наведении
  </p>
</div>
```

---

### 3. Инпуты и формы

```jsx
<input
  type="text"
  placeholder="✍️ Введите текст..."
  className="input-ios w-full"
/>

<textarea
  placeholder="📝 Описание проекта..."
  className="input-ios w-full min-h-[120px]"
/>
```

#### Поле с иконкой:
```jsx
<div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
  <input
    type="search"
    placeholder="Поиск..."
    className="input-ios w-full pl-12"
  />
</div>
```

---

## Правила для iOS-стиля (заголовок и выпадающее меню рабочей области)
- **Pill-кнопки проектов**: `rounded-full`, padding ≥ 10px 18px, `gap: 1rem` между эмодзи и текстом. Активное состояние — градиент из цвета проекта (`linear-gradient(135deg, project.color, project.color cc, project.color)`), белые текст и chevron, лёгкий подъем `transform: translateY(-1px)`, тень `shadow-md`. Неактивное — белый фон, `border: var(--border)`, тень `shadow-sm`, на hover — `shadow-md`.
- **Дропдауны**: контейнер `rounded-2xl`, фон `bg-white/95` + `backdrop-blur`, бордер `border-white/70`, тень `0 20px 60px rgba(0,0,0,0.14)`, отступ сверху 12px от кнопки.
- **Пункты меню**: отступы `px-4 py-3`, `gap: 1rem`, иконка размер ~20px с лёгкой тенью, заголовок `font-semibold 14px`, подпись uppercase 10px `text-[var(--text-secondary)]`.
- **Слои**: контейнер топ-бара и dropdown — `relative overflow-visible z-50`, чтобы выпадающее меню не обрезалось соседними панелями.
- **Консистентность**: все новые кнопки с эмодзи используют класс `emoji-gap` для визуального “таб”-пробела между иконкой и текстом.

---

### 4. Бейджи и теги

```jsx
<span className="badge">
  🔥 Новое
</span>

<span className="badge" style={{ background: 'var(--success)' }}>
  ✅ Активно
</span>

<span className="badge" style={{ background: 'var(--warning)' }}>
  ⚠️ Ожидание
</span>
```

---

### 5. Заголовки секций

Используйте этот шаблон для создания заголовков секций с эмодзи и градиентной линией:

```jsx
<div className="flex items-center gap-4 px-3">
  <div className="flex items-center gap-2">
    <span className="text-xl">🗂️</span>
    <h2 className="text-sm font-bold uppercase tracking-[0.15em]"
        style={{ color: 'var(--text-primary)' }}>
      Рабочие столы
    </h2>
  </div>
  <div className="h-px flex-1"
       style={{ background: 'linear-gradient(90deg, var(--border), transparent)' }} />
</div>
```

#### Примеры с разными эмодзи:
```jsx
// Проекты
🗂️ + "ПРОЕКТЫ"

// Функции
⚡ + "ФУНКЦИИ"

// Настройки
⚙️ + "НАСТРОЙКИ"

// Аналитика
📊 + "АНАЛИТИКА"
```

---

### 6. Кнопки переключения рабочих столов

#### Активная кнопка:
```jsx
<button
  className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold
             transition-all duration-200 border-2 button-rounded"
  style={{
    borderColor: 'var(--primary)',
    backgroundColor: 'var(--surface-glass)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-md)',
    backdropFilter: 'blur(20px)'
  }}
>
  <span
    className="h-3 w-3 rounded-full shadow-sm"
    style={{
      background: '#B8C5F2', // Цвет проекта
      boxShadow: '0 0 8px #B8C5F2'
    }}
  />
  <span>Название проекта</span>
</button>
```

#### Неактивная кнопка:
```jsx
<button
  className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold
             transition-all duration-200 border-2 rounded-xl"
  style={{
    borderColor: 'var(--border)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    boxShadow: 'none',
    backdropFilter: 'none'
  }}
>
  <span
    className="h-3 w-3 rounded-full shadow-sm"
    style={{
      background: 'var(--text-muted)',
      boxShadow: 'none'
    }}
  />
  <span>Название проекта</span>
</button>
```

#### Ключевые различия:
| Свойство | Активная | Неактивная |
|----------|----------|------------|
| Класс скругления | `button-rounded` | `rounded-xl` |
| Border Color | `var(--primary)` | `var(--border)` |
| Background | `var(--surface-glass)` | `transparent` |
| Shadow | `var(--shadow-md)` | `none` |
| Blur | `blur(20px)` | `none` |
| Цветной индикатор | Светится | Серый |

---

### 7. Разделители

```jsx
<div className="divider" />
```

---

## Примеры обновления существующих компонентов

### TopNav.tsx - Обновление навигации

#### Было (темная тема):
```jsx
<button className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/5">
  Проект
</button>
```

#### Стало (светлая пастель):
```jsx
<button className="button-rounded btn-primary">
  🎯 Проект
</button>
```

---

### TabsBar.tsx - Обновление вкладок

#### Было:
```jsx
<div className="border-cyan-400/60 bg-white/5 shadow-[0_12px_35px_rgba(34,211,238,0.2)]">
```

#### Стало:
```jsx
<div className="card-glass border-2" style={{ borderColor: 'var(--primary)' }}>
```

#### Полный пример вкладки:
```jsx
<div
  className={`
    card-glass px-6 py-3 cursor-pointer transition-all duration-300
    ${isActive ? 'scale-105' : 'scale-100'}
  `}
  style={{
    borderColor: isActive ? 'var(--primary)' : 'var(--border)',
    borderWidth: isActive ? '2px' : '1px'
  }}
>
  <span className="text-base">📄</span>
  <span className="text-sm font-medium">{tab.title}</span>
</div>
```

---

### Shell.tsx - Обновление боковых панелей

**Важно**: Используйте `card-static` для больших панелей, чтобы они не поднимались при наведении:

```jsx
<header className="card-static px-5 h-16 flex items-center">
  {topNav}
</header>

<aside className="card-static h-full overflow-y-auto custom-scrollbar p-4">
  {/* Содержимое sidebar */}
</aside>

<main className="card-static flex-1 relative flex flex-col overflow-hidden">
  {children}
</main>
```

---

## Эмодзи для различных элементов

### Бизнес и работа
- 💼 Проекты
- 📊 Аналитика
- 📈 Статистика
- 💰 Финансы
- 🎯 Цели
- ✅ Задачи
- 📋 Списки

### Коммуникация
- 💬 Чаты
- 🤖 Боты
- 📧 Почта
- 🔔 Уведомления
- 👥 Команда

### Действия
- ➕ Добавить
- ✏️ Редактировать
- 🗑️ Удалить
- 💾 Сохранить
- 🔄 Обновить
- ⚙️ Настройки
- 🔍 Поиск

### Google Таблицы
- 📊 Таблица
- 📁 Папка
- 📝 Документ
- 📉 Отчет
- 🔗 Ссылка

### Статусы
- 🟢 Активно
- 🟡 Ожидание
- 🔴 Ошибка
- ⚪ Неактивно
- ✨ Новое
- 🔥 Популярное
- ⭐ Избранное

---

## Утилиты и хелперы

### Анимация появления
```jsx
<div className="animate-fade-in">
  Появляется плавно
</div>
```

### Пульсирующий эффект
```jsx
<div className="pulse-effect">
  Привлекает внимание
</div>
```

### Эффект матового стекла
```jsx
<div className="glass-effect p-6 rounded-2xl">
  Эффект iOS
</div>
```

### Тултип
```jsx
<button className="tooltip" data-tooltip="Подсказка при наведении">
  ℹ️
</button>
```

---

## Лучшие практики

### 1. Используйте CSS-переменные
```jsx
// ✅ Правильно
<div style={{ color: 'var(--text-primary)' }}>Текст</div>

// ❌ Неправильно
<div className="text-[#2E3A4D]">Текст</div>
```

### 2. Комбинируйте классы
```jsx
<button className="button-rounded btn-primary animate-fade-in">
  Кнопка с анимацией
</button>
```

### 3. Добавляйте эмодзи для визуальной привлекательности
```jsx
<h2 className="text-xl font-bold">📊 Аналитика проекта</h2>
```

### 4. Выбор правильного класса карточки

#### Используйте `card-glass`:
```jsx
// Для кнопок, маленьких элементов, интерактивных компонентов
<div className="card-glass p-6 space-y-4 cursor-pointer">
  {/* Интерактивный элемент */}
</div>
```

#### Используйте `card-static`:
```jsx
// Для больших панелей, контейнеров, элементов без hover
<div className="card-static p-6 space-y-4">
  {/* Большая панель или контейнер */}
</div>
```

### 5. Hover-эффекты
```jsx
<div className="card-glass hover:scale-105 transition-transform cursor-pointer">
  Интерактивная карточка
</div>
```

---

## Адаптивность

Все компоненты поддерживают адаптивный дизайн через Tailwind классы:

```jsx
<div className="card-glass p-4 md:p-6 lg:p-8">
  {/* Отступы меняются на разных экранах */}
</div>

<button className="button-rounded btn-primary text-sm md:text-base">
  Адаптивный размер текста
</button>
```

---

## Примеры готовых секций

### Секция с рабочими столами

Полный пример секции с заголовком и переключателем:

```jsx
<div className="flex flex-col gap-3">
  {/* Заголовок секции */}
  <div className="flex items-center gap-4 px-3">
    <div className="flex items-center gap-2">
      <span className="text-xl">🗂️</span>
      <h2 className="text-sm font-bold uppercase tracking-[0.15em]"
          style={{ color: 'var(--text-primary)' }}>
        Рабочие столы
      </h2>
    </div>
    <div className="h-px flex-1"
         style={{ background: 'linear-gradient(90deg, var(--border), transparent)' }} />
  </div>

  {/* Переключатель рабочих столов */}
  <div className="flex items-center gap-2 px-3">
    {workspaces.map((workspace) => {
      const isActive = workspace.id === activeWorkspace;
      return (
        <button
          key={workspace.id}
          onClick={() => setActiveWorkspace(workspace.id)}
          className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold
                      transition-all duration-200 border-2
                      ${isActive ? 'button-rounded' : 'rounded-xl'}`}
          style={{
            borderColor: isActive ? 'var(--primary)' : 'var(--border)',
            backgroundColor: isActive ? 'var(--surface-glass)' : 'transparent',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: isActive ? 'var(--shadow-md)' : 'none',
            backdropFilter: isActive ? 'blur(20px)' : 'none'
          }}
        >
          <span
            className="h-3 w-3 rounded-full shadow-sm"
            style={{
              background: isActive ? workspace.color : 'var(--text-muted)',
              boxShadow: isActive ? `0 0 8px ${workspace.color}` : 'none'
            }}
          />
          <span>{workspace.name}</span>
        </button>
      );
    })}
  </div>
</div>
```

---

### Карточка проекта
```jsx
<div className="card-glass p-6 space-y-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
           style={{ background: 'var(--primary)' }}>
        💼
      </div>
      <div>
        <h3 className="font-semibold text-lg">Название проекта</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Описание проекта
        </p>
      </div>
    </div>
    <span className="badge">🔥 Активно</span>
  </div>

  <div className="divider" />

  <div className="flex gap-2">
    <button className="button-rounded btn-primary flex-1">
      ✏️ Редактировать
    </button>
    <button className="button-rounded btn-secondary flex-1">
      👁️ Просмотр
    </button>
  </div>
</div>
```

### Форма поиска с результатами
```jsx
<div className="space-y-4">
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
    <input
      type="search"
      placeholder="Поиск проектов..."
      className="input-ios w-full pl-12"
    />
  </div>

  <div className="space-y-2">
    {results.map((result) => (
      <div key={result.id} className="card-glass p-4 cursor-pointer">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{result.icon}</span>
          <div className="flex-1">
            <h4 className="font-semibold">{result.title}</h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {result.description}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## Переход от старого дизайна

### Замена цветов:

| Старый (темный) | Новый (светлый) |
|----------------|-----------------|
| `bg-[#060910]` | `style={{ background: 'var(--background)' }}` |
| `text-white` | `style={{ color: 'var(--text-primary)' }}` |
| `border-white/10` | `style={{ borderColor: 'var(--border)' }}` |
| `bg-cyan-500/20` | `btn-primary` класс |
| `bg-white/5` | `card-glass` класс |

### Замена компонентов:

```jsx
// Старая кнопка
<button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
  Кнопка
</button>

// Новая кнопка
<button className="button-rounded btn-primary">
  ✨ Кнопка
</button>
```

---

## История обновлений

### Версия 2.0 (2025-12-03)

#### Добавлено:
- ✅ Класс `card-static` для больших панелей без hover-эффекта
- ✅ Шаблон заголовков секций с эмодзи и градиентной линией
- ✅ Паттерн кнопок переключения рабочих столов (активная/неактивная)
- ✅ Таблица различий между активными и неактивными состояниями
- ✅ Полный пример секции с рабочими столами
- ✅ Рекомендации по выбору между `card-glass` и `card-static`

#### Изменено:
- 🔄 Раздел "Карточки с эффектом стекла" разделен на два подраздела
- 🔄 Обновлены примеры для Shell.tsx с использованием `card-static`
- 🔄 Добавлены детальные различия в визуальных состояниях кнопок

#### Правила обновления:
- 📝 Эта документация должна обновляться при каждом изменении архитектуры
- 📝 Всегда синхронизируйте с ARCHITECTURE.md

---

Наслаждайтесь новым дизайном! 🎨✨
