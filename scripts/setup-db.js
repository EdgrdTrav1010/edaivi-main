/**
 * EdAiVi Studio - Database Setup Script
 * 
 * This script initializes the MongoDB database with initial data:
 * - Creates required collections
 * - Adds admin user
 * - Adds sample AI models
 * - Sets up indexes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Import models
const User = require('../models/User');
const AIModel = require('../models/AIModel');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edaivi';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('📦 MongoDB connected successfully');
  setupDatabase();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Setup database
async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Create admin user if not exists
    await createAdminUser();
    
    // Create sample AI models
    await createSampleAIModels();
    
    // Setup indexes
    await setupIndexes();
    
    console.log('✅ Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup error:', error);
    process.exit(1);
  }
}

// Create admin user
async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@edaivi.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return;
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      displayName: 'Admin',
      role: 'admin',
      isVerified: true,
      subscription: {
        plan: 'enterprise',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      usage: {
        storage: 0,
        aiCredits: 1000,
        lastLogin: new Date(),
        loginCount: 1
      }
    });
    
    await adminUser.save();
    console.log('👤 Admin user created successfully');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Create sample AI models
async function createSampleAIModels() {
  try {
    // Check if AI models already exist
    const existingModels = await AIModel.countDocuments();
    
    if (existingModels > 0) {
      console.log('🤖 Sample AI models already exist');
      return;
    }
    
    // Create sample AI models
    const sampleModels = [
      // Text generation model
      {
        name: 'text-gen-basic',
        displayName: 'TextGen Basic',
        description: 'Basic text generation model for general purpose use',
        type: 'text-generation',
        provider: 'internal',
        category: 'text',
        tags: ['text', 'generation', 'basic'],
        isPublic: true,
        isActive: true,
        isFeatured: true,
        thumbnailUrl: 'https://storage.edaivi.com/models/text-gen-basic.jpg',
        currentVersion: '1.0.0',
        versions: [
          {
            version: '1.0.0',
            releaseDate: new Date(),
            description: 'Initial release',
            isActive: true,
            parameters: [
              {
                name: 'temperature',
                displayName: 'Temperature',
                description: 'Controls randomness of output',
                type: 'number',
                defaultValue: 0.7,
                minValue: 0.1,
                maxValue: 1.0,
                step: 0.1,
                isRequired: false,
                isAdvanced: false,
                group: 'Generation',
                order: 1
              },
              {
                name: 'maxTokens',
                displayName: 'Max Tokens',
                description: 'Maximum number of tokens to generate',
                type: 'number',
                defaultValue: 256,
                minValue: 1,
                maxValue: 4096,
                step: 1,
                isRequired: false,
                isAdvanced: false,
                group: 'Generation',
                order: 2
              }
            ]
          }
        ],
        defaultParameters: [
          {
            name: 'temperature',
            displayName: 'Temperature',
            description: 'Controls randomness of output',
            type: 'number',
            defaultValue: 0.7,
            minValue: 0.1,
            maxValue: 1.0,
            step: 0.1,
            isRequired: false,
            isAdvanced: false,
            group: 'Generation',
            order: 1
          },
          {
            name: 'maxTokens',
            displayName: 'Max Tokens',
            description: 'Maximum number of tokens to generate',
            type: 'number',
            defaultValue: 256,
            minValue: 1,
            maxValue: 4096,
            step: 1,
            isRequired: false,
            isAdvanced: false,
            group: 'Generation',
            order: 2
          }
        ],
        inputFormats: ['text/plain'],
        outputFormats: ['text/plain'],
        maxInputSize: 4096,
        maxOutputSize: 4096,
        processingTime: {
          min: 500,
          average: 2000,
          max: 5000
        },
        costPerUse: 0.01,
        creditsPerUse: 1,
        usageStats: {
          totalUsage: 0,
          usageByDay: new Map(),
          usageByUser: new Map(),
          averageProcessingTime: 0,
          averageTokenCount: 0,
          averageCost: 0,
          lastUsed: new Date()
        },
        restrictions: {
          minUserLevel: 'free',
          maxDailyUses: 50,
          requiresApproval: false
        },
        examples: [
          {
            title: 'Story Generation',
            description: 'Generate a short story about a space adventure',
            inputData: 'Write a short story about a space explorer who discovers a new planet.',
            outputData: 'Captain Zara looked out the viewport of her small exploration vessel...',
            thumbnailUrl: 'https://storage.edaivi.com/examples/story-gen.jpg'
          }
        ]
      },
      
      // Image generation model
      {
        name: 'image-gen-basic',
        displayName: 'ImageGen Basic',
        description: 'Basic image generation model for creating images from text descriptions',
        type: 'image-generation',
        provider: 'internal',
        category: 'image',
        tags: ['image', 'generation', 'basic'],
        isPublic: true,
        isActive: true,
        isFeatured: true,
        thumbnailUrl: 'https://storage.edaivi.com/models/image-gen-basic.jpg',
        currentVersion: '1.0.0',
        versions: [
          {
            version: '1.0.0',
            releaseDate: new Date(),
            description: 'Initial release',
            isActive: true,
            parameters: [
              {
                name: 'width',
                displayName: 'Width',
                description: 'Width of the generated image',
                type: 'number',
                defaultValue: 512,
                minValue: 256,
                maxValue: 1024,
                step: 64,
                isRequired: false,
                isAdvanced: false,
                group: 'Dimensions',
                order: 1
              },
              {
                name: 'height',
                displayName: 'Height',
                description: 'Height of the generated image',
                type: 'number',
                defaultValue: 512,
                minValue: 256,
                maxValue: 1024,
                step: 64,
                isRequired: false,
                isAdvanced: false,
                group: 'Dimensions',
                order: 2
              }
            ]
          }
        ],
        defaultParameters: [
          {
            name: 'width',
            displayName: 'Width',
            description: 'Width of the generated image',
            type: 'number',
            defaultValue: 512,
            minValue: 256,
            maxValue: 1024,
            step: 64,
            isRequired: false,
            isAdvanced: false,
            group: 'Dimensions',
            order: 1
          },
          {
            name: 'height',
            displayName: 'Height',
            description: 'Height of the generated image',
            type: 'number',
            defaultValue: 512,
            minValue: 256,
            maxValue: 1024,
            step: 64,
            isRequired: false,
            isAdvanced: false,
            group: 'Dimensions',
            order: 2
          }
        ],
        inputFormats: ['text/plain'],
        outputFormats: ['image/png', 'image/jpeg'],
        maxInputSize: 1000,
        processingTime: {
          min: 2000,
          average: 5000,
          max: 10000
        },
        costPerUse: 0.02,
        creditsPerUse: 2,
        usageStats: {
          totalUsage: 0,
          usageByDay: new Map(),
          usageByUser: new Map(),
          averageProcessingTime: 0,
          averageTokenCount: 0,
          averageCost: 0,
          lastUsed: new Date()
        },
        restrictions: {
          minUserLevel: 'free',
          maxDailyUses: 20,
          requiresApproval: false
        },
        examples: [
          {
            title: 'Landscape Generation',
            description: 'Generate a beautiful landscape image',
            inputData: 'A beautiful mountain landscape with a lake and forest at sunset',
            thumbnailUrl: 'https://storage.edaivi.com/examples/landscape-gen.jpg'
          }
        ]
      },
      
      // Audio generation model
      {
        name: 'tts-basic',
        displayName: 'Text-to-Speech Basic',
        description: 'Basic text-to-speech model for converting text to natural-sounding speech',
        type: 'text-to-speech',
        provider: 'internal',
        category: 'audio',
        tags: ['audio', 'speech', 'tts', 'basic'],
        isPublic: true,
        isActive: true,
        isFeatured: true,
        thumbnailUrl: 'https://storage.edaivi.com/models/tts-basic.jpg',
        currentVersion: '1.0.0',
        versions: [
          {
            version: '1.0.0',
            releaseDate: new Date(),
            description: 'Initial release',
            isActive: true,
            parameters: [
              {
                name: 'voice',
                displayName: 'Voice',
                description: 'Voice to use for speech synthesis',
                type: 'enum',
                defaultValue: 'female-1',
                options: ['female-1', 'female-2', 'male-1', 'male-2'],
                isRequired: false,
                isAdvanced: false,
                group: 'Voice',
                order: 1
              },
              {
                name: 'speed',
                displayName: 'Speed',
                description: 'Speed of speech',
                type: 'number',
                defaultValue: 1.0,
                minValue: 0.5,
                maxValue: 2.0,
                step: 0.1,
                isRequired: false,
                isAdvanced: false,
                group: 'Voice',
                order: 2
              }
            ]
          }
        ],
        defaultParameters: [
          {
            name: 'voice',
            displayName: 'Voice',
            description: 'Voice to use for speech synthesis',
            type: 'enum',
            defaultValue: 'female-1',
            options: ['female-1', 'female-2', 'male-1', 'male-2'],
            isRequired: false,
            isAdvanced: false,
            group: 'Voice',
            order: 1
          },
          {
            name: 'speed',
            displayName: 'Speed',
            description: 'Speed of speech',
            type: 'number',
            defaultValue: 1.0,
            minValue: 0.5,
            maxValue: 2.0,
            step: 0.1,
            isRequired: false,
            isAdvanced: false,
            group: 'Voice',
            order: 2
          }
        ],
        inputFormats: ['text/plain'],
        outputFormats: ['audio/mp3', 'audio/wav'],
        maxInputSize: 5000,
        processingTime: {
          min: 1000,
          average: 3000,
          max: 8000
        },
        costPerUse: 0.01,
        creditsPerUse: 1,
        usageStats: {
          totalUsage: 0,
          usageByDay: new Map(),
          usageByUser: new Map(),
          averageProcessingTime: 0,
          averageTokenCount: 0,
          averageCost: 0,
          lastUsed: new Date()
        },
        restrictions: {
          minUserLevel: 'free',
          maxDailyUses: 30,
          requiresApproval: false
        },
        examples: [
          {
            title: 'Narration',
            description: 'Generate narration for a short story',
            inputData: 'Once upon a time, in a land far away, there lived a brave knight who dreamed of adventure.',
            thumbnailUrl: 'https://storage.edaivi.com/examples/narration-gen.jpg'
          }
        ]
      }
    ];
    
    // Save sample models
    await AIModel.insertMany(sampleModels);
    console.log('🤖 Sample AI models created successfully');
  } catch (error) {
    console.error('❌ Error creating sample AI models:', error);
    throw error;
  }
}

// Setup indexes
async function setupIndexes() {
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ displayName: 1 });
    await User.collection.createIndex({ role: 1 });
    
    // AI Model indexes
    await AIModel.collection.createIndex({ name: 1 }, { unique: true });
    await AIModel.collection.createIndex({ displayName: 1 });
    await AIModel.collection.createIndex({ type: 1 });
    await AIModel.collection.createIndex({ category: 1 });
    await AIModel.collection.createIndex({ isActive: 1 });
    await AIModel.collection.createIndex({ isFeatured: 1 });
    await AIModel.collection.createIndex({ tags: 1 });
    
    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    throw error;
  }
}
