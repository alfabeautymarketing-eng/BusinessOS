# BusinessOS Server

FastAPI backend для BusinessOS приложения.

## Установка

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Настройка

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. **Настройка Google Services (опционально):**

   Если вам нужна интеграция с Google Sheets/Drive/Apps Script:

   - Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте новый проект или выберите существующий
   - Включите APIs: Google Sheets API, Google Drive API, Apps Script API
   - Создайте Service Account
   - Скачайте JSON файл с credentials
   - Сохраните его как `credentials.json` в папке `server/`
   - Убедитесь, что в `.env` указано: `GOOGLE_APPLICATION_CREDENTIALS=credentials.json`

3. **Gemini API Key (опционально):**

   - Получите API ключ на [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Добавьте в `.env`: `GEMINI_API_KEY=your_key_here`

## Запуск

```bash
uvicorn main:app --reload --port 8000
```

Сервер будет доступен по адресу: `http://localhost:8000`

API документация: `http://localhost:8000/docs`

## Структура

```
server/
├── api/              # API endpoints
│   └── sheets.py     # Google Sheets интеграция
├── services/         # Бизнес-логика
│   └── google_service.py  # Google Services
├── main.py           # FastAPI приложение
├── .env              # Переменные окружения (не коммитится)
└── .env.example      # Пример переменных окружения
```

## Deployment на Render

При деплое на Render добавьте переменные окружения через Dashboard:

1. `GOOGLE_APPLICATION_CREDENTIALS` - содержимое JSON файла credentials (как текст)
2. `GEMINI_API_KEY` - ваш API ключ

**Примечание:** Сервер работает без credentials, но функции Google Services будут недоступны.
