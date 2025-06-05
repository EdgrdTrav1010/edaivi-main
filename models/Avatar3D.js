/**
 * EdAiVi Studio - 3D Avatar Model
 * 
 * This model represents a 3D avatar in the EdAiVi Studio platform.
 * It includes metadata, model references, animations, and customization options.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Animation Schema - represents an animation for a 3D avatar
const AnimationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Animation name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['idle', 'walk', 'run', 'talk', 'dance', 'gesture', 'emotion', 'custom'],
    default: 'custom'
  },
  fileUrl: {
    type: String,
    required: [true, 'Animation file URL is required']
  },
  thumbnailUrl: String,
  duration: {
    type: Number,
    default: 0
  },
  loopable: {
    type: Boolean,
    default: false
  },
  tags: [String],
  metadata: {
    originalFilename: String,
    fileSize: Number,
    format: String,
    frameCount: Number,
    frameRate: Number
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    prompt: String,
    model: String,
    parameters: {
      type: Map,
      of: Schema.Types.Mixed
    },
    generationDate: Date
  }
}, {
  timestamps: true
});

// Texture Schema - represents a texture for a 3D avatar
const TextureSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Texture name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['diffuse', 'normal', 'specular', 'roughness', 'metallic', 'emissive', 'ao', 'height', 'custom'],
    default: 'diffuse'
  },
  fileUrl: {
    type: String,
    required: [true, 'Texture file URL is required']
  },
  thumbnailUrl: String,
  resolution: {
    width: {
      type: Number,
      default: 1024
    },
    height: {
      type: Number,
      default: 1024
    }
  },
  metadata: {
    originalFilename: String,
    fileSize: Number,
    format: String
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    prompt: String,
    model: String,
    parameters: {
      type: Map,
      of: Schema.Types.Mixed
    },
    generationDate: Date
  }
}, {
  timestamps: true
});

// Morph Target Schema - represents a morph target (blend shape) for a 3D avatar
const MorphTargetSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Morph target name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['face', 'body', 'expression', 'custom'],
    default: 'face'
  },
  defaultValue: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  minValue: {
    type: Number,
    default: 0
  },
  maxValue: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Voice Schema - represents a voice for a 3D avatar
const VoiceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Voice name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['tts', 'recorded', 'ai-cloned', 'custom'],
    default: 'tts'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'neutral', 'other'],
    default: 'neutral'
  },
  language: {
    type: String,
    default: 'en'
  },
  sampleUrl: String,
  settings: {
    pitch: {
      type: Number,
      default: 1.0
    },
    rate: {
      type: Number,
      default: 1.0
    },
    volume: {
      type: Number,
      default: 1.0
    }
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    model: String,
    referenceAudio: String,
    parameters: {
      type: Map,
      of: Schema.Types.Mixed
    },
    generationDate: Date
  }
}, {
  timestamps: true
});

// 3D Avatar Schema
const Avatar3DSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Avatar name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Avatar owner is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['human', 'animal', 'fantasy', 'robot', 'abstract', 'other'],
    default: 'human'
  },
  thumbnailUrl: String,
  previewUrls: [String],
  modelUrl: {
    type: String,
    required: [true, 'Model URL is required']
  },
  format: {
    type: String,
    enum: ['glb', 'gltf', 'fbx', 'obj', 'custom'],
    default: 'glb'
  },
  scale: {
    x: {
      type: Number,
      default: 1.0
    },
    y: {
      type: Number,
      default: 1.0
    },
    z: {
      type: Number,
      default: 1.0
    }
  },
  animations: [AnimationSchema],
  textures: [TextureSchema],
  morphTargets: [MorphTargetSchema],
  voice: VoiceSchema,
  rigged: {
    type: Boolean,
    default: true
  },
  rigType: {
    type: String,
    enum: ['humanoid', 'custom', 'none'],
    default: 'humanoid'
  },
  physics: {
    enabled: {
      type: Boolean,
      default: false
    },
    colliders: [{
      type: {
        type: String,
        enum: ['box', 'sphere', 'capsule', 'mesh', 'custom'],
        required: true
      },
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      rotation: {
        x: Number,
        y: Number,
        z: Number
      },
      size: {
        x: Number,
        y: Number,
        z: Number
      }
    }],
    softBodies: [{
      name: String,
      stiffness: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1
      },
      mass: {
        type: Number,
        default: 1.0
      }
    }]
  },
  metadata: {
    polyCount: Number,
    vertexCount: Number,
    textureCount: Number,
    animationCount: Number,
    fileSize: Number,
    originalFilename: String,
    software: String,
    version: String,
    tags: [String]
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    prompt: String,
    model: String,
    parameters: {
      type: Map,
      of: Schema.Types.Mixed
    },
    generationDate: Date,
    referenceImages: [String]
  },
  customProperties: {
    type: Map,
    of: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'archived'],
    default: 'completed'
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

// Virtual for avatar URL
Avatar3DSchema.virtual('url').get(function() {
  return `/avatars/${this._id}`;
});

// Method to add an animation
Avatar3DSchema.methods.addAnimation = function(animationData) {
  this.animations.push(animationData);
  this.metadata.animationCount = this.animations.length;
  return this.save();
};

// Method to add a texture
Avatar3DSchema.methods.addTexture = function(textureData) {
  this.textures.push(textureData);
  this.metadata.textureCount = this.textures.length;
  return this.save();
};

// Method to clone avatar
Avatar3DSchema.methods.clone = async function(newOwnerId, newName) {
  const clonedData = this.toObject();
  
  // Remove fields that shouldn't be cloned
  delete clonedData._id;
  delete clonedData.id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  
  // Update fields for the clone
  clonedData.owner = newOwnerId;
  clonedData.name = newName || `${this.name} (Clone)`;
  clonedData.isPublic = false;
  clonedData.isTemplate = false;
  
  // Create new avatar
  const Avatar3D = this.constructor;
  const clonedAvatar = new Avatar3D(clonedData);
  await clonedAvatar.save();
  
  return clonedAvatar;
};

// Create model from schema
const Avatar3D = mongoose.model('Avatar3D', Avatar3DSchema);

module.exports = Avatar3D;
