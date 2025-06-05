/**
 * EdAiVi Studio - AI Routes
 * 
 * This file contains all routes related to AI models and operations:
 * - AI model listing and information
 * - Text generation
 * - Image generation
 * - Audio generation and processing
 * - Video generation and processing
 * - 3D model generation
 */

const express = require('express');
const router = express.Router();
const AIModel = require('../models/AIModel');
const User = require('../models/User');
const { verifyToken } = require('./auth');

// Get all available AI models
router.get('/models', verifyToken, async (req, res) => {
  try {
    const { category, type, featured } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (featured === 'true') query.isFeatured = true;
    
    // Check user subscription level for restricted models
    const userSubscription = req.user.subscription.plan || 'free';
    
    // Get models
    let models = await AIModel.find(query).sort({ isFeatured: -1, name: 1 });
    
    // Filter models based on user subscription
    models = models.filter(model => {
      const minLevel = model.restrictions?.minUserLevel || 'free';
      const subscriptionLevels = ['free', 'basic', 'pro', 'enterprise'];
      const userLevelIndex = subscriptionLevels.indexOf(userSubscription);
      const requiredLevelIndex = subscriptionLevels.indexOf(minLevel);
      
      return userLevelIndex >= requiredLevelIndex;
    });
    
    res.json(models);
  } catch (error) {
    console.error('Ошибка получения AI моделей:', error);
    res.status(500).json({ 
      error: 'Ошибка получения AI моделей',
      message: error.message
    });
  }
});

// Get a specific AI model
router.get('/models/:id', verifyToken, async (req, res) => {
  try {
    const model = await AIModel.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ 
        error: 'Модель не найдена',
        message: 'AI модель не найдена'
      });
    }
    
    // Check if model is active
    if (!model.isActive) {
      return res.status(403).json({ 
        error: 'Модель недоступна',
        message: 'Эта AI модель в настоящее время недоступна'
      });
    }
    
    // Check user subscription level for restricted models
    const userSubscription = req.user.subscription.plan || 'free';
    const minLevel = model.restrictions?.minUserLevel || 'free';
    const subscriptionLevels = ['free', 'basic', 'pro', 'enterprise'];
    const userLevelIndex = subscriptionLevels.indexOf(userSubscription);
    const requiredLevelIndex = subscriptionLevels.indexOf(minLevel);
    
    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: `Для использования этой модели требуется подписка уровня ${minLevel} или выше`
      });
    }
    
    res.json(model);
  } catch (error) {
    console.error('Ошибка получения AI модели:', error);
    res.status(500).json({ 
      error: 'Ошибка получения AI модели',
      message: error.message
    });
  }
});

// Text generation
router.post('/generate/text', verifyToken, async (req, res) => {
  try {
    const { modelId, prompt, parameters } = req.body;
    
    // Validate input
    if (!modelId || !prompt) {
      return res.status(400).json({ 
        error: 'Неверные параметры',
        message: 'Требуется modelId и prompt'
      });
    }
    
    // Get model
    const model = await AIModel.findById(modelId);
    
    if (!model) {
      return res.status(404).json({ 
        error: 'Модель не найдена',
        message: 'AI модель не найдена'
      });
    }
    
    // Check if model is active and of correct type
    if (!model.isActive) {
      return res.status(403).json({ 
        error: 'Модель недоступна',
        message: 'Эта AI модель в настоящее время недоступна'
      });
    }
    
    if (model.type !== 'text-generation') {
      return res.status(400).json({ 
        error: 'Неверный тип модели',
        message: 'Эта модель не предназначена для генерации текста'
      });
    }
    
    // Check user subscription level
    const userSubscription = req.user.subscription.plan || 'free';
    const minLevel = model.restrictions?.minUserLevel || 'free';
    const subscriptionLevels = ['free', 'basic', 'pro', 'enterprise'];
    const userLevelIndex = subscriptionLevels.indexOf(userSubscription);
    const requiredLevelIndex = subscriptionLevels.indexOf(minLevel);
    
    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: `Для использования этой модели требуется подписка уровня ${minLevel} или выше`
      });
    }
    
    // Check if user has enough credits
    if (req.user.usage.aiCredits < model.creditsPerUse) {
      return res.status(403).json({ 
        error: 'Недостаточно кредитов',
        message: `Для использования этой модели требуется ${model.creditsPerUse} кредитов. У вас ${req.user.usage.aiCredits} кредитов.`
      });
    }
    
    // TODO: Implement actual text generation using the model
    // This would typically involve calling an external API or service
    
    // For now, return a mock response
    const startTime = Date.now();
    const generatedText = `Сгенерированный текст на основе запроса: "${prompt}"\n\nЭто демонстрационный ответ от модели ${model.displayName}. В реальной реализации здесь будет текст, сгенерированный AI моделью.`;
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Update model usage stats
    await model.updateUsageStats(
      req.user._id,
      processingTime,
      prompt.length, // Mock token count
      model.costPerUse
    );
    
    // Deduct credits from user
    await req.user.updateAiCredits(-model.creditsPerUse);
    
    res.json({
      text: generatedText,
      model: {
        id: model._id,
        name: model.displayName
      },
      processingTime,
      creditsUsed: model.creditsPerUse
    });
  } catch (error) {
    console.error('Ошибка генерации текста:', error);
    res.status(500).json({ 
      error: 'Ошибка генерации текста',
      message: error.message
    });
  }
});

// Image generation
router.post('/generate/image', verifyToken, async (req, res) => {
  try {
    const { modelId, prompt, parameters } = req.body;
    
    // Validate input
    if (!modelId || !prompt) {
      return res.status(400).json({ 
        error: 'Неверные параметры',
        message: 'Требуется modelId и prompt'
      });
    }
    
    // Get model
    const model = await AIModel.findById(modelId);
    
    if (!model) {
      return res.status(404).json({ 
        error: 'Модель не найдена',
        message: 'AI модель не найдена'
      });
    }
    
    // Check if model is active and of correct type
    if (!model.isActive) {
      return res.status(403).json({ 
        error: 'Модель недоступна',
        message: 'Эта AI модель в настоящее время недоступна'
      });
    }
    
    if (model.type !== 'image-generation') {
      return res.status(400).json({ 
        error: 'Неверный тип модели',
        message: 'Эта модель не предназначена для генерации изображений'
      });
    }
    
    // Check user subscription level
    const userSubscription = req.user.subscription.plan || 'free';
    const minLevel = model.restrictions?.minUserLevel || 'free';
    const subscriptionLevels = ['free', 'basic', 'pro', 'enterprise'];
    const userLevelIndex = subscriptionLevels.indexOf(userSubscription);
    const requiredLevelIndex = subscriptionLevels.indexOf(minLevel);
    
    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: `Для использования этой модели требуется подписка уровня ${minLevel} или выше`
      });
    }
    
    // Check if user has enough credits
    if (req.user.usage.aiCredits < model.creditsPerUse) {
      return res.status(403).json({ 
        error: 'Недостаточно кредитов',
        message: `Для использования этой модели требуется ${model.creditsPerUse} кредитов. У вас ${req.user.usage.aiCredits} кредитов.`
      });
    }
    
    // TODO: Implement actual image generation using the model
    // This would typically involve calling an external API or service
    
    // For now, return a mock response
    const startTime = Date.now();
    const imageUrl = `https://storage.edaivi.com/generated/images/${Date.now()}.jpg`;
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Update model usage stats
    await model.updateUsageStats(
      req.user._id,
      processingTime,
      prompt.length, // Mock token count
      model.costPerUse
    );
    
    // Deduct credits from user
    await req.user.updateAiCredits(-model.creditsPerUse);
    
    res.json({
      imageUrl,
      model: {
        id: model._id,
        name: model.displayName
      },
      prompt,
      processingTime,
      creditsUsed: model.creditsPerUse
    });
  } catch (error) {
    console.error('Ошибка генерации изображения:', error);
    res.status(500).json({ 
      error: 'Ошибка генерации изображения',
      message: error.message
    });
  }
});

// Audio generation
router.post('/generate/audio', verifyToken, async (req, res) => {
  try {
    const { modelId, prompt, parameters } = req.body;
    
    // Validate input
    if (!modelId || !prompt) {
      return res.status(400).json({ 
        error: 'Неверные параметры',
        message: 'Требуется modelId и prompt'
      });
    }
    
    // Get model
    const model = await AIModel.findById(modelId);
    
    if (!model) {
      return res.status(404).json({ 
        error: 'Модель не найдена',
        message: 'AI модель не найдена'
      });
    }
    
    // Check if model is active and of correct type
    if (!model.isActive) {
      return res.status(403).json({ 
        error: 'Модель недоступна',
        message: 'Эта AI модель в настоящее время недоступна'
      });
    }
    
    if (model.type !== 'audio-generation' && model.type !== 'text-to-speech') {
      return res.status(400).json({ 
        error: 'Неверный тип модели',
        message: 'Эта модель не предназначена для генерации аудио'
      });
    }
    
    // Check user subscription level
    const userSubscription = req.user.subscription.plan || 'free';
    const minLevel = model.restrictions?.minUserLevel || 'free';
    const subscriptionLevels = ['free', 'basic', 'pro', 'enterprise'];
    const userLevelIndex = subscriptionLevels.indexOf(userSubscription);
    const requiredLevelIndex = subscriptionLevels.indexOf(minLevel);
    
    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: `Для использования этой модели требуется подписка уровня ${minLevel} или выше`
      });
    }
    
    // Check if user has enough credits
    if (req.user.usage.aiCredits < model.creditsPerUse) {
      return res.status(403).json({ 
        error: 'Недостаточно кредитов',
        message: `Для использования этой модели требуется ${model.creditsPerUse} кредитов. У вас ${req.user.usage.aiCredits} кредитов.`
      });
    }
    
    // TODO: Implement actual audio generation using the model
    // This would typically involve calling an external API or service
    
    // For now, return a mock response
    const startTime = Date.now();
    const audioUrl = `https://storage.edaivi.com/generated/audio/${Date.now()}.mp3`;
    const duration = 10.5; // seconds
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Update model usage stats
    await model.updateUsageStats(
      req.user._id,
      processingTime,
      prompt.length, // Mock token count
      model.costPerUse
    );
    
    // Deduct credits from user
    await req.user.updateAiCredits(-model.creditsPerUse);
    
    res.json({
      audioUrl,
      duration,
      model: {
        id: model._id,
        name: model.displayName
      },
      prompt,
      processingTime,
      creditsUsed: model.creditsPerUse
    });
  } catch (error) {
    console.error('Ошибка генерации аудио:', error);
    res.status(500).json({ 
      error: 'Ошибка генерации аудио',
      message: error.message
    });
  }
});

// Get user AI credits
router.get('/credits', verifyToken, async (req, res) => {
  try {
    res.json({
      credits: req.user.usage.aiCredits
    });
  } catch (error) {
    console.error('Ошибка получения AI кредитов:', error);
    res.status(500).json({ 
      error: 'Ошибка получения AI кредитов',
      message: error.message
    });
  }
});

// Purchase AI credits
router.post('/credits/purchase', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Неверные параметры',
        message: 'Требуется положительное значение amount'
      });
    }
    
    // TODO: Implement payment processing
    
    // For now, just add credits
    await req.user.updateAiCredits(amount);
    
    res.json({
      message: `Успешно приобретено ${amount} AI кредитов`,
      credits: req.user.usage.aiCredits
    });
  } catch (error) {
    console.error('Ошибка покупки AI кредитов:', error);
    res.status(500).json({ 
      error: 'Ошибка покупки AI кредитов',
      message: error.message
    });
  }
});

module.exports = router;
