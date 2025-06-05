const express = require('express');
// const rateLimit = require('express-rate-limit'); // Commented out temporarily
// const tf = require('@tensorflow/tfjs-node'); // Comment this out temporarily
const { Server } = require('socket.io');
const { createServer } = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configuration
const PORT = process.env.PORT || 8082;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edaivi';

// Import models
const User = require('./models/User');
const AudioProject = require('./models/AudioProject');
const VideoProject = require('./models/VideoProject');
const Avatar3D = require('./models/Avatar3D');
const Scene3D = require('./models/Scene3D');
const StreamSession = require('./models/StreamSession');
const AIModel = require('./models/AIModel');

// Connect to MongoDB - commented out since MongoDB is not installed
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => {
//   console.log('📦 MongoDB connected successfully');
// })
// .catch(err => {
//   console.error('❌ MongoDB connection error:', err);
//   console.log('📦 Continuing without MongoDB for testing');
// });
console.log('📦 MongoDB connection skipped - using mock data for testing');

// Setup mock data and handlers for testing without MongoDB
const mockUsers = [
  {
    _id: 'user1',
    email: 'admin@edaivi.com',
    displayName: 'Admin User',
    role: 'admin',
    isVerified: true,
    avatar: 'default-avatar.png',
    subscription: { plan: 'enterprise' },
    usage: { aiCredits: 1000 },
    comparePassword: async () => true
  },
  {
    _id: 'user2',
    email: 'edgrd.88@gmail.com',
    displayName: 'Developer',
    role: 'admin',
    isVerified: true,
    avatar: 'default-avatar.png',
    subscription: { plan: 'enterprise' },
    usage: { aiCredits: 1000 },
    comparePassword: async () => true
  }
];

// Mock find methods for User model
User.findOne = async (query) => {
  if (query.email) {
    return mockUsers.find(user => user.email === query.email);
  }
  return null;
};

User.findById = async (id) => {
  return mockUsers.find(user => user._id === id);
};

// Add mock methods to User prototype
User.prototype.updateAiCredits = async function(amount) {
  this.usage.aiCredits += amount;
  return this;
};

User.prototype.save = async function() {
  return this;
};

// Mock AI models
const mockAIModels = [
  {
    _id: 'model1',
    name: 'text-gen-basic',
    displayName: 'TextGen Basic',
    description: 'Базовая модель генерации текста',
    type: 'text-generation',
    category: 'text',
    isActive: true,
    creditsPerUse: 1,
    costPerUse: 0.01,
    restrictions: { minUserLevel: 'free' },
    updateUsageStats: async () => {}
  },
  {
    _id: 'model2',
    name: 'image-gen-basic',
    displayName: 'ImageGen Basic',
    description: 'Базовая модель генерации изображений',
    type: 'image-generation',
    category: 'image',
    isActive: true,
    creditsPerUse: 2,
    costPerUse: 0.02,
    restrictions: { minUserLevel: 'free' },
    updateUsageStats: async () => {}
  },
  {
    _id: 'model3',
    name: 'tts-basic',
    displayName: 'TTS Basic',
    description: 'Базовая модель преобразования текста в речь',
    type: 'text-to-speech',
    category: 'audio',
    isActive: true,
    creditsPerUse: 1,
    costPerUse: 0.01,
    restrictions: { minUserLevel: 'free' },
    updateUsageStats: async () => {}
  }
];

// Mock methods for AIModel
AIModel.find = async (query) => {
  return mockAIModels.filter(model => {
    if (query.isActive !== undefined && model.isActive !== query.isActive) return false;
    if (query.category && model.category !== query.category) return false;
    if (query.type && model.type !== query.type) return false;
    if (query.isFeatured && !model.isFeatured) return false;
    return true;
  });
};

AIModel.findById = async (id) => {
  return mockAIModels.find(model => model._id === id);
};

// Mock audio projects
const mockAudioProjects = [
  {
    _id: 'project1',
    title: 'Демо проект 1',
    description: 'Тестовый аудио проект',
    owner: 'user1',
    isPublic: true,
    tracks: [],
    duration: 0,
    bpm: 120,
    addTrack: async function(track) {
      this.tracks.push(track);
      return this;
    },
    removeTrack: async function(trackId) {
      this.tracks = this.tracks.filter(t => t._id !== trackId);
      return this;
    },
    updateTrack: async function(trackId, trackData) {
      const index = this.tracks.findIndex(t => t._id === trackId);
      if (index !== -1) {
        this.tracks[index] = { ...this.tracks[index], ...trackData };
      }
      return this;
    },
    export: async function(format, quality) {
      return {
        url: `https://example.com/export_${this._id}.${format || 'mp3'}`,
        format: format || 'mp3',
        quality: quality || 'high',
        duration: this.duration,
        fileSize: 1000000,
        createdAt: new Date()
      };
    },
    save: async function() {
      return this;
    }
  }
];

// Mock methods for AudioProject
AudioProject.find = async (query) => {
  return mockAudioProjects;
};

AudioProject.findById = async (id) => {
  return mockAudioProjects.find(project => project._id === id);
};

// Import routes
const authRoutes = require('./routes/auth');
const audioRoutes = require('./routes/audio');
const aiRoutes = require('./routes/ai');
// Uncomment these when the routes are implemented
// const videoRoutes = require('./routes/video');
// const avatarRoutes = require('./routes/avatar');
// const sceneRoutes = require('./routes/scene');
// const streamRoutes = require('./routes/stream');

// Security middleware
// app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting - commented out temporarily
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: 429,
//     error: 'Too many requests, please try again later.'
//   }
// });

// Apply rate limiting to API routes
// app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/ai', aiRoutes);
// Uncomment these when the routes are implemented
// app.use('/api/video', videoRoutes);
// app.use('/api/avatar', avatarRoutes);
// app.use('/api/scene', sceneRoutes);
// app.use('/api/stream', streamRoutes);

// Base route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// API info route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'EdAiVi Studio API запущен!',
    version: '1.0.0',
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /',
      'GET /api/status',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/profile',
      'GET /api/audio',
      'GET /api/video',
      'GET /api/avatar',
      'GET /api/scene',
      'GET /api/stream',
      'GET /api/ai'
    ]
  });
});

// Server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO setup
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  
  // Join room (for project collaboration, streaming, etc.)
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
    console.log(`👤 User ${userId} joined room ${roomId}`);
  });
  
  // Leave room
  socket.on('leave-room', (roomId, userId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', userId);
    console.log(`👤 User ${userId} left room ${roomId}`);
  });
  
  // Chat message
  socket.on('chat-message', (roomId, message) => {
    socket.to(roomId).emit('chat-message', message);
  });
  
  // Project update
  socket.on('project-update', (roomId, update) => {
    socket.to(roomId).emit('project-update', update);
  });
  
  // Stream events
  socket.on('stream-event', (streamId, event) => {
    socket.to(streamId).emit('stream-event', event);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// 404 handler
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
      'GET /api/auth/profile',
      'GET /api/audio',
      'GET /api/video',
      'GET /api/avatar',
      'GET /api/scene',
      'GET /api/stream',
      'GET /api/ai'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Сервер EdAiVi Studio запущен!`);
  console.log(`📡 Порт: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`⏰ Время запуска: ${new Date().toLocaleString()}`);
  console.log(`🔌 Socket.IO активен`);
  console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  console.log('📋 Доступные маршруты:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
  console.log(`   GET  http://localhost:${PORT}/api/audio`);
  console.log(`   GET  http://localhost:${PORT}/api/video`);
  console.log(`   GET  http://localhost:${PORT}/api/avatar`);
  console.log(`   GET  http://localhost:${PORT}/api/scene`);
  console.log(`   GET  http://localhost:${PORT}/api/stream`);
  console.log(`   GET  http://localhost:${PORT}/api/ai`);
  console.log('='.repeat(50));
});

module.exports = app;
