# ARGO Web

Веб-клиент «Арго» на React/Vite. Сервер остаётся единственным источником правды:
клиент только показывает подтверждённые данные и отправляет свободный текст приказа.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000/web/
npm run typecheck
npm run build      # статическая сборка в dist/
```

`VITE_API_URL` и `VITE_WS_URL` необязательны: по умолчанию используется
`https://v3310666.hosted-by-vdsina.ru`. Сборка рассчитана на базовый путь `/web/`
(настройка `base` в `vite.config.ts` и `basename` в роутере).

## Что подключено

- Вход и регистрация по имени игрока и паролю (`/api/auth/*`, `/api/me`).
- Список кампаний, создание новой игры, экран хода со свободным текстом.
- Опрос `/api/campaign/{id}/step/status` и WebSocket `/ws/campaign/{id}`.
- История ходов, персонаж и сумка, карта Москвы по `/api/map/{pack_id}` и `map_nodes`.
- Уточнение приказа: `clarification_id` передаётся обратно при ответе.

Все ответы проверяются Zod-схемами из `src/api/schemas`.Внутренние поля сервера
в интерфейс не попадают.

## Развёртывание

Статическая сборка копируется в `/var/www/argo-web`; Caddy раздаёт её по
`https://v3310666.hosted-by-vdsina.ru/web/`. Для SPA включён fallback на `index.html`.
