/**
 * EdAiVi Studio - Authentication Routes
 * 
 * This file contains all routes related to user authentication:
 * - Registration
 * - Login
 * - Profile management
 * - Password reset
 * - Email verification
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Отсутствует токен авторизации',
        message: 'Пожалуйста, войдите в систему'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Недействительный токен',
        message: 'Пользователь не найден'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Ошибка верификации токена:', error);
    return res.status(401).json({ 
      error: 'Недействительный токен',
      message: error.message
    });
  }
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь уже существует',
        message: 'Пользователь с таким email уже зарегистрирован'
      });
    }
    
    // Create new user
    const newUser = new User({
      email,
      password, // Will be hashed by the pre-save hook in the User model
      displayName
    });
    
    // Generate verification token
    const verificationToken = newUser.generateVerificationToken();
    
    // Save user to database
    await newUser.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // TODO: Send verification email
    
    // Return user data and token
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        isVerified: newUser.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Ошибка регистрации',
      message: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверные учетные данные',
        message: 'Неверный email или пароль'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверные учетные данные',
        message: 'Неверный email или пароль'
      });
    }
    
    // Update last login
    user.usage.lastLogin = new Date();
    user.usage.loginCount += 1;
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Return user data and token
    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ 
      error: 'Ошибка входа',
      message: error.message
    });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      subscription: user.subscription,
      usage: {
        storage: user.usage.storage,
        aiCredits: user.usage.aiCredits,
        lastLogin: user.usage.lastLogin,
        loginCount: user.usage.loginCount
      },
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ 
      error: 'Ошибка получения профиля',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, preferences } = req.body;
    const user = req.user;
    
    // Update fields
    if (displayName) user.displayName = displayName;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    
    res.json({
      message: 'Профиль успешно обновлен',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ 
      error: 'Ошибка обновления профиля',
      message: error.message
    });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный пароль',
        message: 'Текущий пароль неверен'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({ 
      error: 'Ошибка изменения пароля',
      message: error.message
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь не найден',
        message: 'Пользователь с таким email не найден'
      });
    }
    
    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();
    
    // TODO: Send password reset email
    
    res.json({
      message: 'Инструкции по сбросу пароля отправлены на ваш email'
    });
  } catch (error) {
    console.error('Ошибка запроса сброса пароля:', error);
    res.status(500).json({ 
      error: 'Ошибка запроса сброса пароля',
      message: error.message
    });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Недействительный токен',
        message: 'Токен сброса пароля недействителен или истек'
      });
    }
    
    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Create JWT token
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      message: 'Пароль успешно сброшен',
      token: jwtToken
    });
  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    res.status(500).json({ 
      error: 'Ошибка сброса пароля',
      message: error.message
    });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Недействительный токен',
        message: 'Токен верификации недействителен или истек'
      });
    }
    
    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    
    res.json({
      message: 'Email успешно подтвержден'
    });
  } catch (error) {
    console.error('Ошибка верификации email:', error);
    res.status(500).json({ 
      error: 'Ошибка верификации email',
      message: error.message
    });
  }
});

// Logout (client-side only, just for API documentation)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Выход выполнен успешно'
  });
});

// Hidden developer login endpoint
router.post('/dev-login', async (req, res) => {
  try {
    const { email, password, devKey } = req.body;
    
    // Verify the developer key
    if (devKey !== process.env.DEV_ACCESS_KEY && devKey !== 'edaivi-dev-secret-2025') {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'Неверный ключ разработчика'
      });
    }
    
    // Check if this is the owner email
    const isOwner = email === process.env.OWNER_EMAIL;
    
    if (!isOwner) {
      return res.status(401).json({ 
        error: 'Доступ запрещен',
        message: 'Только владелец может войти как разработчик'
      });
    }
    
    // Skip database check in development mode
    // Create a mock user object
    const mockUser = {
      _id: 'dev-user-id',
      email: email,
      displayName: 'Разработчик',
      role: 'admin',
      isVerified: true,
      avatar: 'default-avatar.png',
      preferences: {
        theme: 'system',
        language: 'ru'
      }
    };
    
    // Create JWT token with developer flag
    const token = jwt.sign(
      { 
        userId: mockUser._id,
        isDeveloper: true,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' } // Shorter expiration for developer sessions
    );
    
    // Return user data and token
    res.json({
      message: 'Вход владельца (администратора) выполнен успешно',
      user: {
        id: mockUser._id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        role: mockUser.role,
        isVerified: mockUser.isVerified,
        avatar: mockUser.avatar,
        preferences: mockUser.preferences,
        isDeveloper: true
      },
      token
    });
  } catch (error) {
    console.error('Ошибка входа разработчика:', error);
    res.status(500).json({ 
      error: 'Ошибка входа',
      message: error.message
    });
  }
});

// Export the router and verifyToken middleware
module.exports = router;
module.exports.verifyToken = verifyToken;
