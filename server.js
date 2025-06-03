const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Базовый маршрут
app.get('/', (req, res) => {
    res.json({ 
        message: 'EdAiVi Studio API запущен!',
        version: '1.0.0',
        status: 'working',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/profile'
        ]
    });
});

// Простые маршруты аутентификации
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    res.json({ 
        message: 'Login route - временно отключен',
        received: { email, password: password ? '***' : undefined },
        timestamp: new Date().toISOString()
    });
});

app.post('/api/auth/register', (req, res) => {
    const { email, password, displayName } = req.body;
    res.json({ 
        message: 'Register route - временно отключен',
        received: { email, displayName, password: password ? '***' : undefined },
        timestamp: new Date().toISOString()
    });
});

app.get('/api/auth/profile', (req, res) => {
    res.json({ 
        message: 'Profile route - временно отключен',
        timestamp: new Date().toISOString()
    });
});

// Статус сервера
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Маршрут не найден',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableRoutes: [
            'GET /',
            'GET /api/status',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/profile'
        ]
    });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err.stack);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Сервер EdAiVi Studio запущен!`);
    console.log(`📡 Порт: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`⏰ Время запуска: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));
    console.log('📋 Доступные маршруты:');
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/api/status`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
    console.log('='.repeat(50));
});

module.exports = app;