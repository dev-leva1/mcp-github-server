require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const githubRoutes = require('./routes/github');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Базовый маршрут
app.get('/api', (req, res) => {
  res.json({ message: 'MCP GitHub API Server работает!' });
});

// Маршруты GitHub API
app.use('/api', githubRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере для доступа к клиенту`);
}); 