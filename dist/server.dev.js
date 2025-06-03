"use strict";

var express = require('express');

var cors = require('cors');

var path = require('path');

var app = express();
var PORT = process.env.PORT || 3001; // Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); // Базовый маршрут

app.get('/', function (req, res) {
  res.json({
    message: 'EdAiVi Studio API запущен!',
    version: '1.0.0',
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: ['GET /', 'POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile']
  });
}); // Простые маршруты аутентификации

app.post('/api/auth/login', function (req, res) {
  var _req$body = req.body,
      email = _req$body.email,
      password = _req$body.password;
  res.json({
    message: 'Login route - временно отключен',
    received: {
      email: email,
      password: password ? '***' : undefined
    },
    timestamp: new Date().toISOString()
  });
});
app.post('/api/auth/register', function (req, res) {
  var _req$body2 = req.body,
      email = _req$body2.email,
      password = _req$body2.password,
      displayName = _req$body2.displayName;
  res.json({
    message: 'Register route - временно отключен',
    received: {
      email: email,
      displayName: displayName,
      password: password ? '***' : undefined
    },
    timestamp: new Date().toISOString()
  });
});
app.get('/api/auth/profile', function (req, res) {
  res.json({
    message: 'Profile route - временно отключен',
    timestamp: new Date().toISOString()
  });
}); // Статус сервера

app.get('/api/status', function (req, res) {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
}); // Обработка 404

app.use('*', function (req, res) {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: ['GET /', 'GET /api/status', 'POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile']
  });
}); // Глобальная обработка ошибок

app.use(function (err, req, res, next) {
  console.error('❌ Ошибка сервера:', err.stack);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: err.message,
    timestamp: new Date().toISOString()
  });
}); // Запуск сервера

app.listen(PORT, function () {
  console.log('='.repeat(50));
  console.log("\uD83D\uDE80 \u0421\u0435\u0440\u0432\u0435\u0440 EdAiVi Studio \u0437\u0430\u043F\u0443\u0449\u0435\u043D!");
  console.log("\uD83D\uDCE1 \u041F\u043E\u0440\u0442: ".concat(PORT));
  console.log("\uD83C\uDF10 URL: http://localhost:".concat(PORT));
  console.log("\u23F0 \u0412\u0440\u0435\u043C\u044F \u0437\u0430\u043F\u0443\u0441\u043A\u0430: ".concat(new Date().toLocaleString()));
  console.log('='.repeat(50));
  console.log('📋 Доступные маршруты:');
  console.log("   GET  http://localhost:".concat(PORT, "/"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/status"));
  console.log("   POST http://localhost:".concat(PORT, "/api/auth/login"));
  console.log("   POST http://localhost:".concat(PORT, "/api/auth/register"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/auth/profile"));
  console.log('='.repeat(50));
});
module.exports = app;
//# sourceMappingURL=server.dev.js.map
