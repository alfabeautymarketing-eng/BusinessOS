# Обновленный план реализации Business OS (версия 2.0)

**Дата обновления:** 2025-12-02
**Статус:** Фаза 1 завершена, переход к Фазе 2

---

## 📋 История изменений от предыдущего плана

### Изменения от пользователя:

1. **Cosmetic Analysis Dashboard**
   - **Было:** Интеграция через iframe внутри приложения (порт 3001)
   - **Стало:** Открывается в новой вкладке браузера (обычная ссылка)
   - **Причина:** Дашборд будет использоваться в другом проекте, должен быть отдельным

2. **Аутентификация Google**
   - **Было:** Service Account (credentials.json)
   - **Стало:** OAuth 2.0 (логин пользователя через Google)
   - **Причина:** Service Account требует ручной расшаривания каждой таблицы/папки
   - **Преимущества OAuth:**
     - Автоматический доступ ко всем файлам пользователя
     - Не нужно расшаривать каждую таблицу вручную
     - Агент работает от имени пользователя

3. **Дизайн интерфейса**
   - Добавлены примеры из скриншота пользователя:
     - Smart Border с крестиками для закрытия меток колонок
     - Статус "Linked Scripts: 3 active | Last Git Commit: 2 min ago"
     - Контекстные теги в поле ввода чата `[[Col:Объем]]`
     - Вкладки Agent Sidebar: [Чат] [Логи] [Git]

---

## ✅ Фаза 1: ЗАВЕРШЕНА (8/8 задач)

### Критические исправления Backend
- ✅ Исправлен импорт `google_service` - добавлен синглтон
- ✅ Обновлен `requirements.txt` - версия google-auth совместима
- ✅ Обновлен `render.yaml` - Python 3.11

### Базовая навигация Frontend
- ✅ Создан `projects.json` - конфигурация проектов (SK/MT/SS)
- ✅ Создан хук `useTabs.ts` - управление вкладками
- ✅ Создан `TabsBar.tsx` - панель вкладок как в браузере
- ✅ Создан `ContentViewer.tsx` - рендеринг iframe
- ✅ Обновлен `TopNav.tsx` - выпадающие меню проектов

**Результат:**
- Сервер успешно запускается на Render.com
- Работает навигация по проектам с системой вкладок

---

## 🎯 Фаза 2: OAuth 2.0 аутентификация (Priority: CRITICAL)

### Цель
Заменить Service Account на OAuth 2.0 для доступа ко всем файлам Google Drive пользователя без ручной расшаривания.

### 2.1. Настройка Google Cloud Console

**Действия:**
1. Перейти в Google Cloud Console → APIs & Services → Credentials
2. Создать OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`, `https://business-os.onrender.com`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback`, `https://business-os.onrender.com/api/auth/callback`
3. Скачать `client_secret.json`
4. Включить необходимые APIs:
   - Google Sheets API
   - Google Drive API
   - Google Apps Script API

**Требуемые OAuth scopes:**
```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/script.projects
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

### 2.2. Backend: OAuth endpoints

**Файл:** `server/api/auth.py` (новый)

```python
from fastapi import APIRouter, HTTPException
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import json

router = APIRouter(prefix="/api/auth", tags=["auth"])

CLIENT_SECRETS_FILE = os.getenv('GOOGLE_CLIENT_SECRETS_PATH', './client_secret.json')
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]
REDIRECT_URI = os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:3000/api/auth/callback')

@router.get("/login")
async def login():
    """Инициирует OAuth flow"""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    return {"authorization_url": authorization_url, "state": state}

@router.get("/callback")
async def callback(code: str, state: str):
    """Обрабатывает callback от Google"""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
        state=state
    )
    flow.fetch_token(code=code)

    credentials = flow.credentials

    # Сохраняем токены (в production использовать database)
    token_data = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    # TODO: Сохранить в базу данных или session
    with open('user_tokens.json', 'w') as f:
        json.dump(token_data, f)

    return {"status": "success", "message": "Authenticated"}

@router.get("/user")
async def get_user():
    """Получить информацию о текущем пользователе"""
    # TODO: Прочитать из session/database
    if not os.path.exists('user_tokens.json'):
        raise HTTPException(status_code=401, detail="Not authenticated")

    with open('user_tokens.json', 'r') as f:
        token_data = json.load(f)

    credentials = Credentials(**token_data)

    # TODO: Получить информацию о пользователе через People API
    return {"authenticated": True, "email": "user@example.com"}
```

### 2.3. Backend: Обновить GoogleService

**Файл:** `server/services/google_service.py`

**Изменения:**
```python
class GoogleService:
    def __init__(self, credentials=None):
        self.creds = credentials  # Теперь принимает OAuth credentials
        if not self.creds:
            # Fallback на Service Account для локальной разработки
            self._authenticate_service_account()

    def _authenticate_service_account(self):
        """Для локальной разработки (fallback)"""
        creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if creds_path and os.path.exists(creds_path):
            self.creds = service_account.Credentials.from_service_account_file(
                creds_path, scopes=SCOPES
            )

    @staticmethod
    def from_oauth_token(token_data):
        """Создать сервис из OAuth токенов"""
        credentials = Credentials(**token_data)
        return GoogleService(credentials)
```

### 2.4. Frontend: Страница логина

**Файл:** `client/src/app/login/page.tsx` (новый)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/login');
      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800 max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center font-bold">
            B
          </div>
          <h1 className="text-2xl font-bold text-white">Business OS</h1>
        </div>

        <p className="text-gray-400 mb-6">
          Войдите через Google, чтобы получить доступ к своим таблицам и документам
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Вход...' : 'Войти через Google'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Нажимая "Войти", вы даете разрешение на доступ к Google Drive, Sheets и Apps Script
        </p>
      </div>
    </div>
  );
}
```

### 2.5. Frontend: Callback страница

**Файл:** `client/src/app/auth/callback/page.tsx` (новый)

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      fetch(`http://localhost:8000/api/auth/callback?code=${code}&state=${state}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            // Сохраняем состояние аутентификации
            localStorage.setItem('authenticated', 'true');
            router.push('/');
          }
        })
        .catch(error => {
          console.error('Authentication failed:', error);
          router.push('/login');
        });
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p>Завершение аутентификации...</p>
      </div>
    </div>
  );
}
```

---

## 🎨 Фаза 3: Улучшение UI согласно дизайну (Priority: HIGH)

### 3.1. Обновить SheetOverlay (Smart Border)

**Изменения согласно скриншоту:**
1. Добавить крестик (X) для каждой метки колонки
2. Добавить статусную строку внизу: "Linked Scripts: 3 active | Last Git Commit: 2 min ago"

**Файл:** `client/src/components/SheetOverlay.tsx`

```tsx
'use client';

import React from 'react';

interface Column {
  id: string;
  name: string;
  letter: string;
  index: number;
}

interface SheetOverlayProps {
  columns: Column[];
  onColumnClick: (col: Column) => void;
  onColumnClose?: (col: Column) => void;
  linkedScripts?: number;
  lastGitCommit?: string;
}

export default function SheetOverlay({
  columns,
  onColumnClick,
  onColumnClose,
  linkedScripts = 0,
  lastGitCommit = 'никогда'
}: SheetOverlayProps) {
  return (
    <>
      {/* Top Border with Column Tags */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 p-2 bg-black/30 backdrop-blur-sm">
        {columns.map((col) => (
          <div
            key={col.id}
            onClick={() => onColumnClick(col)}
            className="group flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-md cursor-pointer transition-all"
          >
            <span className="text-sm text-purple-200 font-medium">
              {col.letter}: {col.name}
            </span>
            {onColumnClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onColumnClose(col);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-200 hover:text-white"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2L10 10M10 2L2 10" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Linked Scripts: <span className="text-white font-medium">{linkedScripts} active</span>
          </span>
          <span className="text-gray-600">|</span>
          <span>
            Last Git Commit: <span className="text-white font-medium">{lastGitCommit}</span>
          </span>
        </div>
      </div>
    </>
  );
}
```

### 3.2. Обновить AgentSidebar (вкладки Чат/Логи/Git)

**Добавить вкладки согласно дизайну:**

**Файл:** `client/src/components/AgentSidebar.tsx`

```tsx
'use client';

import React, { useState } from 'react';

type TabType = 'chat' | 'logs' | 'git';

export default function AgentSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] border-l border-gray-800">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(['chat', 'logs', 'git'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-white bg-[#252525] border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            {tab === 'chat' ? 'Чат' : tab === 'logs' ? 'Логи' : 'Git'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'git' && <GitTab />}
      </div>

      {/* Input (только для чата) */}
      {activeTab === 'chat' && (
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-xs text-purple-200">
              [[Col:Объем]]
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Введите команду..."
              className="flex-1 px-3 py-2 bg-[#252525] border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-md transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 8l12-6-6 12-2-6z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatTab() {
  return (
    <div className="space-y-4">
      <div className="bg-[#252525] rounded-lg p-3">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-purple-400">User:</span> Если [Col:Объем] пустая, ставь сегодняшнюю.
        </p>
      </div>
      <div className="bg-[#202020] rounded-lg p-3 border border-gray-800">
        <p className="text-sm text-gray-300 mb-2">
          <span className="font-medium text-green-400">Agent:</span> Готово. Скрипт 'autoDate.gs' задеплоен. Триггер 'onEdit' установлен.
        </p>
        <pre className="text-xs text-gray-400 bg-[#1a1a1a] p-2 rounded overflow-x-auto">
{`function agent_autoDate() {
  var counts = {date: getDate()};
  if (isEmpty(cell)) {
    return writeInline(baserate, [Col(Date)])
  }
}`}
        </pre>
      </div>
    </div>
  );
}

function LogsTab() {
  return (
    <div className="font-mono text-xs text-gray-400 space-y-1">
      <div>[12:45:32] Script deployed: autoDate.gs</div>
      <div>[12:45:30] Trigger created: onEdit</div>
      <div>[12:44:15] Git push: main @ 9a3f2b1</div>
    </div>
  );
}

function GitTab() {
  return (
    <div className="space-y-2">
      <div className="bg-[#252525] rounded p-2 text-xs">
        <div className="text-gray-400">Последний коммит:</div>
        <div className="text-white font-mono">feat: add autoDate trigger</div>
        <div className="text-gray-500">2 минуты назад</div>
      </div>
    </div>
  );
}
```

---

## 🔧 Фаза 4: Cosmetic Analysis - открытие в новой вкладке (Priority: MEDIUM)

### 4.1. Изменить поведение кнопки

**Файл:** `client/src/components/TopNav.tsx`

**Изменить обработчик клика:**

```tsx
const handleProjectClick = (project: Project) => {
  // If it's Cosmetic Analysis, open in new tab
  if (project.type === 'internal-app' && project.url) {
    window.open(project.url, '_blank');
    return;
  }

  // Otherwise toggle dropdown
  setOpenDropdown(openDropdown === project.id ? null : project.id);
};
```

### 4.2. Удалить из системы вкладок

**Примечание:** Cosmetic Analysis больше не будет открываться как вкладка внутри приложения, только внешняя ссылка.

---

## 📊 Фаза 5: Два режима агента (Priority: HIGH)

### 5.1. Developer Mode (создание скриптов)

**Функциональность:**
- Чат для описания задач на естественном языке
- Генерация Google Apps Script кода через Gemini AI
- Кнопка "Deploy Script" для деплоя в Apps Script
- История созданных скриптов

### 5.2. Data Agent Mode (работа с данными)

**Функциональность:**
- Команды на естественном языке:
  - "Покажи все файлы в папке 'Исходные документы SK'"
  - "Найди все таблицы с артикулом 12345"
  - "Добавь строку на лист 'Главная' с данными: артикул=ABC, статус=Новый"
- Результаты в табличном виде
- История команд

**Детали реализации в основном плане (/Users/aleksandr/.claude/plans/fancy-questing-wall.md)**

---

## 📋 Итоговый чеклист (обновленный)

### Критичные задачи
- [x] 1. Исправить google_service - синглтон
- [x] 2. Обновить requirements.txt - google-auth версии
- [x] 3. Обновить render.yaml - Python 3.11
- [x] 4. Создать projects.json
- [x] 5. Создать TabsBar.tsx
- [x] 6. Создать ContentViewer.tsx
- [x] 7. Создать useTabs.ts
- [x] 8. Обновить TopNav.tsx

### Высокий приоритет (Фаза 2: OAuth)
- [ ] 9. Настроить Google Cloud Console (OAuth 2.0 Client)
- [ ] 10. Создать api/auth.py (login, callback, user endpoints)
- [ ] 11. Обновить GoogleService для OAuth credentials
- [ ] 12. Создать страницу логина (client/src/app/login/page.tsx)
- [ ] 13. Создать callback страницу (client/src/app/auth/callback/page.tsx)
- [ ] 14. Добавить middleware для проверки аутентификации

### Высокий приоритет (Фаза 3: UI улучшения)
- [ ] 15. Обновить SheetOverlay - крестики на метках + статус-бар внизу
- [ ] 16. Обновить AgentSidebar - вкладки [Чат] [Логи] [Git]
- [ ] 17. Добавить контекстные теги в поле ввода [[Col:Объем]]

### Средний приоритет (Фаза 4: Cosmetic Analysis)
- [ ] 18. Изменить кнопку "Анализ косметики" - открытие в новой вкладке

### Средний приоритет (Фаза 5: Два режима агента)
- [ ] 19. Создать DeveloperMode.tsx
- [ ] 20. Создать DataAgentMode.tsx
- [ ] 21. Создать useAgentMode.ts
- [ ] 22. Реализовать backend endpoints для Data Agent

### Низкий приоритет (Фаза 6: Git Deploy)
- [ ] 23. Создать git_service.py
- [ ] 24. Создать api/deploy.py
- [ ] 25. Создать scripts/deploy.sh
- [ ] 26. Настроить VS Code хоткеи (Ctrl+U)

---

## 🚀 Порядок реализации (обновленный)

### Неделя 1: OAuth 2.0 (4-5 дней)
**День 1-2: Backend OAuth**
1. Настроить Google Cloud Console
2. Создать api/auth.py
3. Обновить GoogleService
4. Тестировать OAuth flow

**День 3-4: Frontend OAuth**
1. Создать страницу логина
2. Создать callback страницу
3. Добавить middleware
4. Интегрировать с основным приложением

**День 5: Тестирование**
- End-to-end тестирование OAuth flow
- Проверка refresh tokens
- Обработка ошибок

### Неделя 2: UI улучшения и функциональность (5 дней)
**День 6: SheetOverlay**
- Крестики на метках колонок
- Статус-бар внизу

**День 7: AgentSidebar**
- Вкладки [Чат] [Логи] [Git]
- Контекстные теги

**День 8: Cosmetic Analysis**
- Изменить открытие в новой вкладке

**День 9-10: Два режима агента**
- Developer Mode
- Data Agent Mode

### Неделя 3: Git Deploy и финальные штрихи (3 дня)
**День 11-12: Git Deploy**
- Ctrl+U хоткей
- Автоматический коммит и пуш

**День 13: Полировка**
- Исправление багов
- Улучшение UX
- Документация

---

## ⚠️ Важные замечания (обновленные)

### 1. OAuth 2.0 настройка

**Consent Screen:**
- Application name: Business OS
- User support email: ваш email
- Developer contact: ваш email
- Scopes: Drive, Sheets, Apps Script, Email, Profile

**Testing:**
- Добавить тестовых пользователей в Google Cloud Console
- В production: Submit для верификации приложения

### 2. Tokens хранение

**Для MVP (текущая версия):**
- Хранить токены в файле `user_tokens.json` (только для разработки!)

**Для production:**
- Использовать базу данных (PostgreSQL/MongoDB)
- Шифровать refresh tokens
- Session management

### 3. Cosmetic Analysis отдельно

**Развертывание:**
- cosmetic-agent должен работать на порту 3001 или на отдельном домене
- Добавить URL в `projects.json`:
  ```json
  {
    "id": "cosmetic-analysis",
    "url": "https://cosmetic-agent.onrender.com"
  }
  ```

### 4. projects.json - заполнение ссылок

**После OAuth реализации:**
- Пользователь сможет выбирать файлы через интерфейс (file picker)
- Автоматическое получение spreadsheet IDs и folder IDs
- Сохранение в LocalStorage или database

---

## 📚 Следующие документы для создания

1. **API_DOCUMENTATION.md** - документация всех endpoints
2. **OAUTH_SETUP_GUIDE.md** - пошаговая настройка OAuth
3. **USER_GUIDE.md** - руководство пользователя
4. **DEVELOPER_GUIDE.md** - руководство разработчика
5. **CHANGELOG.md** - история изменений

---

**Конец обновленного плана реализации**
