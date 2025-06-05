"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express'); // const rateLimit = require('express-rate-limit'); // Commented out temporarily
// const tf = require('@tensorflow/tfjs-node'); // Comment this out temporarily


var _require = require('socket.io'),
    Server = _require.Server;

var _require2 = require('http'),
    createServer = _require2.createServer;

var mongoose = require('mongoose');

var cors = require('cors');

var path = require('path'); // Initialize Express app


var app = express();
var httpServer = createServer(app);
var io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
}); // Configuration

var PORT = process.env.PORT || 8082;
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edaivi'; // Import models

var User = require('./models/User');

var AudioProject = require('./models/AudioProject');

var VideoProject = require('./models/VideoProject');

var Avatar3D = require('./models/Avatar3D');

var Scene3D = require('./models/Scene3D');

var StreamSession = require('./models/StreamSession');

var AIModel = require('./models/AIModel'); // Connect to MongoDB - commented out since MongoDB is not installed
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


console.log('📦 MongoDB connection skipped - using mock data for testing'); // Setup mock data and handlers for testing without MongoDB

var mockUsers = [{
  _id: 'user1',
  email: 'admin@edaivi.com',
  displayName: 'Admin User',
  role: 'admin',
  isVerified: true,
  avatar: 'default-avatar.png',
  subscription: {
    plan: 'enterprise'
  },
  usage: {
    aiCredits: 1000
  },
  comparePassword: function comparePassword() {
    return regeneratorRuntime.async(function comparePassword$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", true);

          case 1:
          case "end":
            return _context.stop();
        }
      }
    });
  }
}, {
  _id: 'user2',
  email: 'edgrd.88@gmail.com',
  displayName: 'Developer',
  role: 'admin',
  isVerified: true,
  avatar: 'default-avatar.png',
  subscription: {
    plan: 'enterprise'
  },
  usage: {
    aiCredits: 1000
  },
  comparePassword: function comparePassword() {
    return regeneratorRuntime.async(function comparePassword$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", true);

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    });
  }
}]; // Mock find methods for User model

User.findOne = function _callee(query) {
  return regeneratorRuntime.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!query.email) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", mockUsers.find(function (user) {
            return user.email === query.email;
          }));

        case 2:
          return _context3.abrupt("return", null);

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
};

User.findById = function _callee2(id) {
  return regeneratorRuntime.async(function _callee2$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          return _context4.abrupt("return", mockUsers.find(function (user) {
            return user._id === id;
          }));

        case 1:
        case "end":
          return _context4.stop();
      }
    }
  });
}; // Add mock methods to User prototype


User.prototype.updateAiCredits = function _callee3(amount) {
  return regeneratorRuntime.async(function _callee3$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          this.usage.aiCredits += amount;
          return _context5.abrupt("return", this);

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};

User.prototype.save = function _callee4() {
  return regeneratorRuntime.async(function _callee4$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          return _context6.abrupt("return", this);

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
}; // Mock AI models


var mockAIModels = [{
  _id: 'model1',
  name: 'text-gen-basic',
  displayName: 'TextGen Basic',
  description: 'Базовая модель генерации текста',
  type: 'text-generation',
  category: 'text',
  isActive: true,
  creditsPerUse: 1,
  costPerUse: 0.01,
  restrictions: {
    minUserLevel: 'free'
  },
  updateUsageStats: function updateUsageStats() {
    return regeneratorRuntime.async(function updateUsageStats$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
          case "end":
            return _context7.stop();
        }
      }
    });
  }
}, {
  _id: 'model2',
  name: 'image-gen-basic',
  displayName: 'ImageGen Basic',
  description: 'Базовая модель генерации изображений',
  type: 'image-generation',
  category: 'image',
  isActive: true,
  creditsPerUse: 2,
  costPerUse: 0.02,
  restrictions: {
    minUserLevel: 'free'
  },
  updateUsageStats: function updateUsageStats() {
    return regeneratorRuntime.async(function updateUsageStats$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
          case "end":
            return _context8.stop();
        }
      }
    });
  }
}, {
  _id: 'model3',
  name: 'tts-basic',
  displayName: 'TTS Basic',
  description: 'Базовая модель преобразования текста в речь',
  type: 'text-to-speech',
  category: 'audio',
  isActive: true,
  creditsPerUse: 1,
  costPerUse: 0.01,
  restrictions: {
    minUserLevel: 'free'
  },
  updateUsageStats: function updateUsageStats() {
    return regeneratorRuntime.async(function updateUsageStats$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
          case "end":
            return _context9.stop();
        }
      }
    });
  }
}]; // Mock methods for AIModel

AIModel.find = function _callee5(query) {
  return regeneratorRuntime.async(function _callee5$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          return _context10.abrupt("return", mockAIModels.filter(function (model) {
            if (query.isActive !== undefined && model.isActive !== query.isActive) return false;
            if (query.category && model.category !== query.category) return false;
            if (query.type && model.type !== query.type) return false;
            if (query.isFeatured && !model.isFeatured) return false;
            return true;
          }));

        case 1:
        case "end":
          return _context10.stop();
      }
    }
  });
};

AIModel.findById = function _callee6(id) {
  return regeneratorRuntime.async(function _callee6$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          return _context11.abrupt("return", mockAIModels.find(function (model) {
            return model._id === id;
          }));

        case 1:
        case "end":
          return _context11.stop();
      }
    }
  });
}; // Mock audio projects


var mockAudioProjects = [{
  _id: 'project1',
  title: 'Демо проект 1',
  description: 'Тестовый аудио проект',
  owner: 'user1',
  isPublic: true,
  tracks: [],
  duration: 0,
  bpm: 120,
  addTrack: function addTrack(track) {
    return regeneratorRuntime.async(function addTrack$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            this.tracks.push(track);
            return _context12.abrupt("return", this);

          case 2:
          case "end":
            return _context12.stop();
        }
      }
    }, null, this);
  },
  removeTrack: function removeTrack(trackId) {
    return regeneratorRuntime.async(function removeTrack$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            this.tracks = this.tracks.filter(function (t) {
              return t._id !== trackId;
            });
            return _context13.abrupt("return", this);

          case 2:
          case "end":
            return _context13.stop();
        }
      }
    }, null, this);
  },
  updateTrack: function updateTrack(trackId, trackData) {
    var index;
    return regeneratorRuntime.async(function updateTrack$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            index = this.tracks.findIndex(function (t) {
              return t._id === trackId;
            });

            if (index !== -1) {
              this.tracks[index] = _objectSpread({}, this.tracks[index], {}, trackData);
            }

            return _context14.abrupt("return", this);

          case 3:
          case "end":
            return _context14.stop();
        }
      }
    }, null, this);
  },
  "export": function _export(format, quality) {
    return regeneratorRuntime.async(function _export$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            return _context15.abrupt("return", {
              url: "https://example.com/export_".concat(this._id, ".").concat(format || 'mp3'),
              format: format || 'mp3',
              quality: quality || 'high',
              duration: this.duration,
              fileSize: 1000000,
              createdAt: new Date()
            });

          case 1:
          case "end":
            return _context15.stop();
        }
      }
    }, null, this);
  },
  save: function save() {
    return regeneratorRuntime.async(function save$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            return _context16.abrupt("return", this);

          case 1:
          case "end":
            return _context16.stop();
        }
      }
    }, null, this);
  }
}]; // Mock methods for AudioProject

AudioProject.find = function _callee7(query) {
  return regeneratorRuntime.async(function _callee7$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          return _context17.abrupt("return", mockAudioProjects);

        case 1:
        case "end":
          return _context17.stop();
      }
    }
  });
};

AudioProject.findById = function _callee8(id) {
  return regeneratorRuntime.async(function _callee8$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          return _context18.abrupt("return", mockAudioProjects.find(function (project) {
            return project._id === id;
          }));

        case 1:
        case "end":
          return _context18.stop();
      }
    }
  });
}; // Import routes


var authRoutes = require('./routes/auth');

var audioRoutes = require('./routes/audio');

var aiRoutes = require('./routes/ai'); // Uncomment these when the routes are implemented
// const videoRoutes = require('./routes/video');
// const avatarRoutes = require('./routes/avatar');
// const sceneRoutes = require('./routes/scene');
// const streamRoutes = require('./routes/stream');
// Security middleware
// app.use(helmet());


app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
})); // Rate limiting - commented out temporarily
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

app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
})); // Static files

app.use(express["static"](path.join(__dirname, 'client'))); // API Routes

app.use('/api/auth', authRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/ai', aiRoutes); // Uncomment these when the routes are implemented
// app.use('/api/video', videoRoutes);
// app.use('/api/avatar', avatarRoutes);
// app.use('/api/scene', sceneRoutes);
// app.use('/api/stream', streamRoutes);
// Base route

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
}); // API info route

app.get('/api', function (req, res) {
  res.json({
    message: 'EdAiVi Studio API запущен!',
    version: '1.0.0',
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: ['GET /', 'GET /api/status', 'POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile', 'GET /api/audio', 'GET /api/video', 'GET /api/avatar', 'GET /api/scene', 'GET /api/stream', 'GET /api/ai']
  });
}); // Server status

app.get('/api/status', function (req, res) {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
}); // Socket.IO setup

io.on('connection', function (socket) {
  console.log("\uD83D\uDD0C Socket connected: ".concat(socket.id)); // Join room (for project collaboration, streaming, etc.)

  socket.on('join-room', function (roomId, userId) {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
    console.log("\uD83D\uDC64 User ".concat(userId, " joined room ").concat(roomId));
  }); // Leave room

  socket.on('leave-room', function (roomId, userId) {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', userId);
    console.log("\uD83D\uDC64 User ".concat(userId, " left room ").concat(roomId));
  }); // Chat message

  socket.on('chat-message', function (roomId, message) {
    socket.to(roomId).emit('chat-message', message);
  }); // Project update

  socket.on('project-update', function (roomId, update) {
    socket.to(roomId).emit('project-update', update);
  }); // Stream events

  socket.on('stream-event', function (streamId, event) {
    socket.to(streamId).emit('stream-event', event);
  }); // Disconnect

  socket.on('disconnect', function () {
    console.log("\uD83D\uDD0C Socket disconnected: ".concat(socket.id));
  });
}); // 404 handler

app.use('*', function (req, res) {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: ['GET /', 'GET /api/status', 'POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile', 'GET /api/audio', 'GET /api/video', 'GET /api/avatar', 'GET /api/scene', 'GET /api/stream', 'GET /api/ai']
  });
}); // Global error handler

app.use(function (err, req, res, next) {
  console.error('❌ Ошибка сервера:', err.stack);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: err.message,
    timestamp: new Date().toISOString()
  });
}); // Start server

httpServer.listen(PORT, function () {
  console.log('='.repeat(50));
  console.log("\uD83D\uDE80 \u0421\u0435\u0440\u0432\u0435\u0440 EdAiVi Studio \u0437\u0430\u043F\u0443\u0449\u0435\u043D!");
  console.log("\uD83D\uDCE1 \u041F\u043E\u0440\u0442: ".concat(PORT));
  console.log("\uD83C\uDF10 URL: http://localhost:".concat(PORT));
  console.log("\u23F0 \u0412\u0440\u0435\u043C\u044F \u0437\u0430\u043F\u0443\u0441\u043A\u0430: ".concat(new Date().toLocaleString()));
  console.log("\uD83D\uDD0C Socket.IO \u0430\u043A\u0442\u0438\u0432\u0435\u043D");
  console.log("\uD83C\uDF0D \u041E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u0435: ".concat(process.env.NODE_ENV || 'development'));
  console.log('='.repeat(50));
  console.log('📋 Доступные маршруты:');
  console.log("   GET  http://localhost:".concat(PORT, "/"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/status"));
  console.log("   POST http://localhost:".concat(PORT, "/api/auth/login"));
  console.log("   POST http://localhost:".concat(PORT, "/api/auth/register"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/auth/profile"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/audio"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/video"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/avatar"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/scene"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/stream"));
  console.log("   GET  http://localhost:".concat(PORT, "/api/ai"));
  console.log('='.repeat(50));
});
module.exports = app;
//# sourceMappingURL=server.dev.js.map
