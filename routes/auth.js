const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    res.json({ message: 'Register route - временно отключен' });
});

// Вход
router.post('/login', async (req, res) => {
    res.json({ message: 'Login route - временно отключен' });
});

// Получение профиля пользователя
router.get('/profile', (req, res) => {
    res.json({ message: 'Profile route - временно отключен' });
});

module.exports = router;