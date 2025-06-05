/**
 * EdAiVi Studio - AI Model
 * 
 * This model represents an AI model in the EdAiVi Studio platform.
 * It includes metadata, parameters, and usage statistics for various AI models
 * used throughout the platform for audio, video, and 3D generation.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Parameter Schema - represents a parameter for an AI model
const ParameterSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Parameter name is required'],
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['number', 'string', 'boolean', 'array', 'object', 'enum'],
    default: 'string'
  },
  defaultValue: Schema.Types.Mixed,
  minValue: Schema.Types.Mixed,
  maxValue: Schema.Types.Mixed,
  step: Number,
  options: [Schema.Types.Mixed], // For enum type
  isRequired: {
    type: Boolean,
    default: false
  },
  isAdvanced: {
    type: Boolean,
    default: false
  },
  group: String,
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Usage Stats Schema - represents usage statistics for an AI model
const UsageStatsSchema = new Schema({
  totalUsage: {
    type: Number,
    default: 0
  },
  usageByDay: {
    type: Map,
    of: Number
  },
  usageByUser: {
    type: Map,
    of: Number
  },
  averageProcessingTime: {
    type: Number,
    default: 0
  },
  averageTokenCount: {
    type: Number,
    default: 0
  },
  averageCost: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Version Schema - represents a version of an AI model
const VersionSchema = new Schema({
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  changes: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  modelUrl: String,
  configUrl: String,
  parameters: [ParameterSchema],
  performance: {
    accuracy: Number,
    speed: Number,
    memoryUsage: Number,
    qualityScore: Number
  }
}, {
  timestamps: true
});

// AI Model Schema
const AIModelSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: [
      'text-generation', 'image-generation', 'audio-generation', 'video-generation',
      'text-to-speech', 'speech-to-text', 'translation', 'summarization',
      'audio-enhancement', 'video-enhancement', 'image-enhancement',
      'audio-separation', 'object-detection', 'face-recognition',
      '3d-model-generation', 'animation-generation', 'custom'
    ],
    required: [true, 'Model type is required']
  },
  provider: {
    type: String,
    enum: ['openai', 'google', 'anthropic', 'stability', 'meta', 'huggingface', 'internal', 'custom'],
    default: 'internal'
  },
  category: {
    type: String,
    enum: ['audio', 'video', 'image', 'text', '3d', 'multimodal'],
    required: [true, 'Model category is required']
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  thumbnailUrl: String,
  demoUrl: String,
  documentationUrl: String,
  apiEndpoint: String,
  apiKey: {
    type: String,
    select: false // Don't include API key in query results by default
  },
  versions: [VersionSchema],
  currentVersion: {
    type: String,
    default: '1.0.0'
  },
  defaultParameters: [ParameterSchema],
  inputFormats: [String],
  outputFormats: [String],
  maxInputSize: Number, // in bytes, tokens, or dimensions
  maxOutputSize: Number, // in bytes, tokens, or dimensions
  processingTime: {
    min: Number, // in milliseconds
    average: Number, // in milliseconds
    max: Number // in milliseconds
  },
  costPerUse: {
    type: Number,
    default: 0
  },
  creditsPerUse: {
    type: Number,
    default: 1
  },
  usageStats: UsageStatsSchema,
  restrictions: {
    minUserLevel: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    maxDailyUses: Number,
    requiresApproval: {
      type: Boolean,
      default: false
    },
    geographicRestrictions: [String]
  },
  examples: [{
    title: String,
    description: String,
    inputData: Schema.Types.Mixed,
    outputData: Schema.Types.Mixed,
    parameters: Schema.Types.Mixed,
    thumbnailUrl: String
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for model URL
AIModelSchema.virtual('url').get(function() {
  return `/ai-models/${this._id}`;
});

// Method to get current version
AIModelSchema.methods.getCurrentVersion = function() {
  return this.versions.find(version => version.version === this.currentVersion);
};

// Method to add a new version
AIModelSchema.methods.addVersion = function(versionData) {
  this.versions.push(versionData);
  return this.save();
};

// Method to update usage stats
AIModelSchema.methods.updateUsageStats = function(userId, processingTime, tokenCount, cost) {
  // Increment total usage
  this.usageStats.totalUsage += 1;
  
  // Update last used timestamp
  this.usageStats.lastUsed = new Date();
  
  // Update usage by day
  const today = new Date().toISOString().split('T')[0];
  const dailyUsage = this.usageStats.usageByDay || new Map();
  dailyUsage.set(today, (dailyUsage.get(today) || 0) + 1);
  this.usageStats.usageByDay = dailyUsage;
  
  // Update usage by user
  if (userId) {
    const userUsage = this.usageStats.usageByUser || new Map();
    userUsage.set(userId.toString(), (userUsage.get(userId.toString()) || 0) + 1);
    this.usageStats.usageByUser = userUsage;
  }
  
  // Update average processing time
  if (processingTime) {
    const currentAvg = this.usageStats.averageProcessingTime || 0;
    const newAvg = (currentAvg * (this.usageStats.totalUsage - 1) + processingTime) / this.usageStats.totalUsage;
    this.usageStats.averageProcessingTime = newAvg;
  }
  
  // Update average token count
  if (tokenCount) {
    const currentAvg = this.usageStats.averageTokenCount || 0;
    const newAvg = (currentAvg * (this.usageStats.totalUsage - 1) + tokenCount) / this.usageStats.totalUsage;
    this.usageStats.averageTokenCount = newAvg;
  }
  
  // Update average cost
  if (cost) {
    const currentAvg = this.usageStats.averageCost || 0;
    const newAvg = (currentAvg * (this.usageStats.totalUsage - 1) + cost) / this.usageStats.totalUsage;
    this.usageStats.averageCost = newAvg;
  }
  
  return this.save();
};

// Create model from schema
const AIModel = mongoose.model('AIModel', AIModelSchema);

module.exports = AIModel;
