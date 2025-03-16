# MCP GitHub Server

Сервер для работы с GitHub API, предоставляющий удобный интерфейс для взаимодействия с репозиториями GitHub.

## Установка

1. Клонируйте репозиторий:
```
git clone https://github.com/fills/mcp-github-server.git
cd mcp-github-server
```

2. Установите зависимости:
```
npm install
```

3. Создайте файл `.env` в корне проекта и добавьте следующие переменные:
```
PORT=3000
GITHUB_TOKEN=your_github_token_here
```

Для получения GitHub токена:
1. Перейдите в настройки вашего аккаунта GitHub
2. Выберите "Developer settings" -> "Personal access tokens" -> "Tokens (classic)"
3. Нажмите "Generate new token"
4. Выберите необходимые разрешения (рекомендуется: repo, user)
5. Скопируйте токен и вставьте его в файл .env

## Запуск

Для запуска в режиме разработки:
```
npm run dev
```

Для запуска в продакшн режиме:
```
npm start
```

## API Endpoints

### Базовый маршрут
- `GET /` - Проверка работоспособности сервера

### Репозитории
- `GET /api/repos/:username` - Получение списка репозиториев пользователя
- `GET /api/repos/:username/:repo` - Получение информации о конкретном репозитории
- `POST /api/repos` - Создание нового репозитория
  - Тело запроса: `{ "name": "repo-name", "description": "description", "private": false }`

### Файлы
- `GET /api/repos/:username/:repo/contents/:path` - Получение содержимого файла из репозитория
- `POST /api/repos/:username/:repo/contents/:path` - Создание нового файла в репозитории
  - Тело запроса: `{ "content": "file content", "message": "commit message" }`

### Ветки
- `GET /api/repos/:username/:repo/branches` - Получение списка веток репозитория
- `POST /api/repos/:username/:repo/branches` - Создание новой ветки в репозитории
  - Тело запроса: `{ "name": "branch-name", "sha": "commit-sha" }`

### Коммиты
- `GET /api/repos/:username/:repo/commits` - Получение списка коммитов репозитория
  - Параметры запроса: `sha`, `path`, `author`, `since`, `until`, `per_page`, `page`
- `POST /api/repos/:username/:repo/commits` - Создание нового коммита
  - Тело запроса: 
  ```json
  { 
    "message": "commit message", 
    "branch": "branch-name", 
    "changes": {
      "path/to/file1.txt": "content of file1",
      "path/to/file2.txt": "content of file2"
    }
  }
  ```

## Примеры использования

### Получение списка репозиториев пользователя
```
GET http://localhost:3000/api/repos/octocat
```

### Создание нового репозитория
```
POST http://localhost:3000/api/repos
Content-Type: application/json

{
  "name": "test-repo",
  "description": "Тестовый репозиторий",
  "private": true
}
```

### Создание файла в репозитории
```
POST http://localhost:3000/api/repos/username/repo-name/contents/path/to/file.txt
Content-Type: application/json

{
  "content": "Содержимое файла",
  "message": "Добавлен новый файл"
}
```

### Создание новой ветки
```
POST http://localhost:3000/api/repos/username/repo-name/branches
Content-Type: application/json

{
  "name": "feature-branch",
  "sha": "optional-commit-sha"
}
```

### Создание коммита с несколькими файлами
```
POST http://localhost:3000/api/repos/username/repo-name/commits
Content-Type: application/json

{
  "message": "Добавлены новые файлы",
  "branch": "feature-branch",
  "changes": {
    "file1.txt": "Содержимое файла 1",
    "dir/file2.txt": "Содержимое файла 2"
  }
}
``` 