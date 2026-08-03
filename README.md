# Visual Agent Architect (VAA)

## 🎯 Описание
Инструмент для визуального проектирования, симуляции и исполнения многоуровневых AI-агентов с динамической маршрутизацией запросов.

## 🚀 Быстрый старт

### Требования
- [Bun](https://bun.sh/) (последняя версия)

### Установка зависимостей
```bash
bun install
```

### Запуск разработки
```bash
# Запуск backend (порт 3000)
cd apps/backend
bun run dev

# В другом терминале - запуск frontend (порт 5173)
cd apps/frontend
bun run dev
```

Или используйте команду из корня:
```bash
bun run dev
```

## 📁 Структура проекта

```
/workspace
├── apps/
│   ├── frontend/          # React + Vite + xyflow
│   └── backend/           # Bun + Hono API
├── packages/
│   ├── domain/            # Типы и доменная логика
│   └── engine/            # Движок исполнения графов
├── contract.md            # Контракт проекта
└── package.json           # Workspace конфигурация
```

## 🔧 API Endpoints

- `GET /api/graphs` - Список всех графов
- `POST /api/graphs` - Создать граф
- `GET /api/graphs/:id` - Получить граф
- `PUT /api/graphs/:id` - Обновить граф
- `DELETE /api/graphs/:id` - Удалить граф
- `POST /api/validate` - Валидировать граф
- `POST /api/execute` - Исполнить граф

## 📝 Пример графа

```json
{
  "id": "uuid",
  "name": "Simple Agent",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "input-1",
      "type": "input",
      "position": { "x": 100, "y": 100 },
      "data": { "label": "User Input" }
    },
    {
      "id": "llm-1",
      "type": "llm",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "Processor",
        "model": "gpt-4o",
        "prompt": "Process: {{input}}"
      }
    },
    {
      "id": "output-1",
      "type": "output",
      "position": { "x": 500, "y": 100 },
      "data": { "label": "Result" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "input-1",
      "target": "llm-1"
    },
    {
      "id": "edge-2",
      "source": "llm-1",
      "target": "output-1"
    }
  ],
  "metadata": {
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🎨 Функционал MVP

- ✅ Визуальный редактор графов (xyflow)
- ✅ Создание узлов 5 типов (input, output, llm, condition, tool)
- ✅ Соединение узлов связями
- ✅ Сохранение графов в памяти
- ✅ Валидация графов
- ✅ Базовый движок исполнения
- ✅ Режим симуляции (mock LLM ответы)

## 📋 Следующие шаги

1. Интеграция с реальными LLM (OpenAI, Anthropic, Ollama)
2. WebSocket для стриминга событий исполнения
3. Панель свойств узла (редактирование промптов, условий)
4. Тепловая карта выполнения (визуализация путей)
5. История исполнений
6. Экспорт/импорт графов

## 📄 Контракт
См. [contract.md](./contract.md) для полной спецификации.

## 🛠️ Технологии

- **Frontend:** React, Vite, xyflow, Zustand, TailwindCSS
- **Backend:** Bun, Hono
- **Domain:** TypeScript, DDD
- **Engine:** Кастомный обход графов на TS
