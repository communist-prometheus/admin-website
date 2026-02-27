# Настройка GitHub Token

## Проблема
Сейчас используются **mock-данные** вместо реального GitHub API.

## Решение

### 1. Создать Personal Access Token

1. Перейти: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Выбрать scopes:
   - ✅ `repo` (полный доступ к репозиториям)
   - ✅ `read:user`
4. **Generate token** → скопировать токен

### 2. Добавить в .env

```bash
# Добавить в C:\Projects\Prometheus\admin-website\.env
GITHUB_TOKEN=ghp_ваш_реальный_токен_здесь
GITHUB_OWNER=communist-prometheus
GITHUB_REPO=public-website
GITHUB_BRANCH=main
GITHUB_CONTENT_PATH=src/content
```

### 3. Перезапустить сервер

```bash
# Завершить текущий процесс
taskkill /F /IM bun.exe

# Запустить заново
bun run dev
```

## Проверка

После настройки токена:
- ❌ Без логина: контент НЕ виден
- ✅ После GitHub OAuth: контент загружается из репозитория
- ✅ Видны реальные файлы из `communist-prometheus/public-website`

## Текущее состояние

**БЕЗ токена используются моки:**
```typescript
const useMock = process.env.NODE_ENV === 'test' || !config.token
```

После добавления токена будет использоваться **реальный GitHub API**.
