/**
 * EdAiVi Studio - 3D Scene Model
 * 
 * This model represents a 3D scene in the EdAiVi Studio platform.
 * It includes metadata, environment settings, lighting, and references to 3D objects.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Light Schema - represents a light in a 3D scene
const LightSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Light name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['ambient', 'directional', 'point', 'spot', 'area', 'hemisphere'],
    default: 'point'
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  intensity: {
    type: Number,
    default: 1.0
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: Number,
      default: 0
    }
  },
  rotation: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: Number,
      default: 0
    }
  },
  castShadow: {
    type: Boolean,
    default: true
  },
  shadowSettings: {
    mapSize: {
      width: {
        type: Number,
        default: 1024
      },
      height: {
        type: Number,
        default: 1024
      }
    },
    bias: {
      type: Number,
      default: 0.0001
    },
    radius: {
      type: Number,
      default: 1
    }
  },
  // Additional properties for specific light types
  distance: Number, // For point and spot lights
  decay: Number, // For point and spot lights
  angle: Number, // For spot lights
  penumbra: Number, // For spot lights
  groundColor: String, // For hemisphere lights
  width: Number, // For area lights
  height: Number // For area lights
}, {
  timestamps: true
});

// Object3D Schema - represents a 3D object in a scene
const Object3DSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Object name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['model', 'primitive', 'avatar', 'particle', 'group', 'ai-generated', 'custom'],
    default: 'model'
  },
  modelUrl: String, // URL to the 3D model file
  thumbnailUrl: String,
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: Number,
      default: 0
    }
  },
  rotation: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: Number,
      default: 0
    }
  },
  scale: {
    x: {
      type: Number,
      default: 1
    },
    y: {
      type: Number,
      default: 1
    },
    z: {
      type: Number,
      default: 1
    }
  },
  visible: {
    type: Boolean,
    default: true
  },
  castShadow: {
    type: Boolean,
    default: true
  },
  receiveShadow: {
    type: Boolean,
    default: true
  },
  // For primitive types
  primitiveType: {
    type: String,
    enum: ['box', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'custom'],
    default: 'box'
  },
  primitiveParams: {
    type: Map,
    of: Schema.Types.Mixed
  },
  // For avatars
  avatarId: {
    type: Schema.Types.ObjectId,
    ref: 'Avatar3D'
  },
  // For particles
  particleSystem: {
    count: {
      type: Number,
      default: 1000
    },
    texture: String,
    size: {
      type: Number,
      default: 0.1
    },
    color: {
      type: String,
      default: '#ffffff'
    },
    speed: {
      type: Number,
      default: 1.0
    },
    lifetime: {
      type: Number,
      default: 5.0
    },
    emitterShape: {
      type: String,
      enum: ['point', 'box', 'sphere', 'custom'],
      default: 'point'
    },
    emitterParams: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  // Physics properties
  physics: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['static', 'dynamic', 'kinematic'],
      default: 'static'
    },
    mass: {
      type: Number,
      default: 1.0
    },
    collider: {
      type: {
        type: String,
        enum: ['box', 'sphere', 'capsule', 'mesh', 'compound', 'none'],
        default: 'box'
      },
      params: {
        type: Map,
        of: Schema.Types.Mixed
      }
    },
    material: {
      friction: {
        type: Number,
        default: 0.5
      },
      restitution: {
        type: Number,
        default: 0.5
      }
    }
  },
  // Interactivity
  interactive: {
    type: Boolean,
    default: false
  },
  interactionType: {
    type: String,
    enum: ['click', 'hover', 'proximity', 'physics', 'custom', 'none'],
    default: 'none'
  },
  interactionEvents: [{
    event: {
      type: String,
      enum: ['click', 'hover', 'collision', 'proximity', 'custom'],
      required: true
    },
    action: {
      type: String,
      enum: ['animation', 'sound', 'teleport', 'toggle', 'script', 'custom'],
      required: true
    },
    params: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }],
  // AI metadata
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
  },
  // Custom properties
  customProperties: {
    type: Map,
    of: Schema.Types.Mixed
  },
  // Metadata
  metadata: {
    polyCount: Number,
    vertexCount: Number,
    textureCount: Number,
    fileSize: Number,
    originalFilename: String,
    format: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Environment Schema - represents the environment settings for a 3D scene
const EnvironmentSchema = new Schema({
  skybox: {
    type: {
      type: String,
      enum: ['color', 'cubemap', 'hdri', 'procedural', 'none'],
      default: 'color'
    },
    value: String, // URL or color value
    rotation: {
      type: Number,
      default: 0
    },
    intensity: {
      type: Number,
      default: 1.0
    }
  },
  fog: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['linear', 'exponential', 'custom'],
      default: 'linear'
    },
    color: {
      type: String,
      default: '#cccccc'
    },
    near: {
      type: Number,
      default: 10
    },
    far: {
      type: Number,
      default: 100
    },
    density: {
      type: Number,
      default: 0.1
    }
  },
  ambient: {
    color: {
      type: String,
      default: '#ffffff'
    },
    intensity: {
      type: Number,
      default: 0.5
    }
  },
  postProcessing: {
    enabled: {
      type: Boolean,
      default: false
    },
    effects: [{
      type: {
        type: String,
        enum: ['bloom', 'dof', 'ssao', 'ssr', 'colorCorrection', 'custom'],
        required: true
      },
      enabled: {
        type: Boolean,
        default: true
      },
      params: {
        type: Map,
        of: Schema.Types.Mixed
      }
    }]
  }
}, {
  timestamps: true
});

// Physics World Schema - represents the physics settings for a 3D scene
const PhysicsWorldSchema = new Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  gravity: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: -9.81
    },
    z: {
      type: Number,
      default: 0
    }
  },
  solver: {
    type: {
      type: String,
      enum: ['default', 'sap', 'naive', 'custom'],
      default: 'default'
    },
    iterations: {
      type: Number,
      default: 10
    }
  },
  debug: {
    enabled: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      enum: ['colliders', 'aabb', 'constraints', 'all'],
      default: 'colliders'
    }
  }
}, {
  timestamps: true
});

// 3D Scene Schema
const Scene3DSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Scene name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Scene owner is required']
  },
  collaborators: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
    enum: ['interior', 'exterior', 'landscape', 'abstract', 'fantasy', 'scifi', 'other'],
    default: 'other'
  },
  thumbnailUrl: String,
  previewUrls: [String],
  environment: EnvironmentSchema,
  lights: [LightSchema],
  objects: [Object3DSchema],
  physics: PhysicsWorldSchema,
  camera: {
    position: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 1.6
      },
      z: {
        type: Number,
        default: 5
      }
    },
    rotation: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      z: {
        type: Number,
        default: 0
      }
    },
    fov: {
      type: Number,
      default: 75
    },
    near: {
      type: Number,
      default: 0.1
    },
    far: {
      type: Number,
      default: 1000
    }
  },
  vr: {
    enabled: {
      type: Boolean,
      default: false
    },
    floorHeight: {
      type: Number,
      default: 0
    },
    locomotion: {
      type: String,
      enum: ['teleport', 'continuous', 'none'],
      default: 'teleport'
    },
    interactionDistance: {
      type: Number,
      default: 5
    }
  },
  audio: {
    ambient: {
      url: String,
      volume: {
        type: Number,
        default: 0.5
      },
      loop: {
        type: Boolean,
        default: true
      }
    },
    spatialSounds: [{
      name: String,
      url: String,
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      radius: {
        type: Number,
        default: 10
      },
      volume: {
        type: Number,
        default: 1.0
      },
      loop: {
        type: Boolean,
        default: false
      },
      autoplay: {
        type: Boolean,
        default: false
      }
    }]
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
  },
  metadata: {
    objectCount: Number,
    lightCount: Number,
    totalPolyCount: Number,
    totalVertexCount: Number,
    tags: [String]
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

// Virtual for scene URL
Scene3DSchema.virtual('url').get(function() {
  return `/scenes/${this._id}`;
});

// Method to add an object
Scene3DSchema.methods.addObject = function(objectData) {
  this.objects.push(objectData);
  this.metadata.objectCount = this.objects.length;
  
  // Update total poly count and vertex count if available
  if (objectData.metadata && objectData.metadata.polyCount) {
    this.metadata.totalPolyCount = (this.metadata.totalPolyCount || 0) + objectData.metadata.polyCount;
  }
  
  if (objectData.metadata && objectData.metadata.vertexCount) {
    this.metadata.totalVertexCount = (this.metadata.totalVertexCount || 0) + objectData.metadata.vertexCount;
  }
  
  return this.save();
};

// Method to add a light
Scene3DSchema.methods.addLight = function(lightData) {
  this.lights.push(lightData);
  this.metadata.lightCount = this.lights.length;
  return this.save();
};

// Method to clone scene
Scene3DSchema.methods.clone = async function(newOwnerId, newName) {
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
  
  // Create new scene
  const Scene3D = this.constructor;
  const clonedScene = new Scene3D(clonedData);
  await clonedScene.save();
  
  return clonedScene;
};

// Create model from schema
const Scene3D = mongoose.model('Scene3D', Scene3DSchema);

module.exports = Scene3D;
