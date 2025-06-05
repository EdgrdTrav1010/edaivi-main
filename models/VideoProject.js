/**
 * EdAiVi Studio - Video Project Model
 * 
 * This model represents a video project in the EdAiVi Studio platform.
 * It includes metadata, processing settings, and references to video files,
 * as well as timeline, scenes, and effects.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Scene Schema - represents a scene in the video project
const SceneSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Scene name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  background: {
    type: {
      type: String,
      enum: ['color', 'image', 'video', 'ai-generated', '3d-scene'],
      default: 'color'
    },
    value: String, // URL or color value
    opacity: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1.0
    }
  },
  transition: {
    type: {
      type: String,
      enum: ['none', 'fade', 'wipe', 'slide', 'zoom', 'ai-transition', 'custom'],
      default: 'none'
    },
    duration: {
      type: Number,
      default: 1.0
    },
    settings: {
      type: Map,
      of: Schema.Types.Mixed
    }
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

// Media Element Schema - represents a media element in a scene
const MediaElementSchema = new Schema({
  type: {
    type: String,
    enum: ['video', 'image', 'audio', 'text', '3d-model', 'ai-generated', 'effect'],
    required: [true, 'Media type is required']
  },
  name: {
    type: String,
    required: [true, 'Media name is required'],
    trim: true
  },
  fileUrl: String,
  thumbnailUrl: String,
  startTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
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
  size: {
    width: {
      type: Number,
      default: 100
    },
    height: {
      type: Number,
      default: 100
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
  opacity: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1.0
  },
  volume: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 2.0
  },
  muted: {
    type: Boolean,
    default: false
  },
  effects: [{
    type: {
      type: String,
      enum: ['blur', 'color', 'transform', 'filter', 'ai-effect', 'custom'],
      required: true
    },
    settings: {
      type: Map,
      of: Schema.Types.Mixed
    },
    enabled: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    }
  }],
  keyframes: [{
    time: {
      type: Number,
      required: true
    },
    properties: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true
    }
  }],
  metadata: {
    originalFilename: String,
    fileSize: Number,
    format: String,
    resolution: {
      width: Number,
      height: Number
    },
    frameRate: Number,
    bitrate: Number,
    codec: String,
    tags: [String]
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
  sceneId: {
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  }
}, {
  timestamps: true
});

// Character Schema - represents a character in the video
const CharacterSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['human', 'animal', 'fantasy', 'ai-generated', 'custom'],
    default: 'human'
  },
  modelUrl: String,
  thumbnailUrl: String,
  animations: [{
    name: String,
    url: String,
    duration: Number
  }],
  voiceSettings: {
    model: String,
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
  aiMetadata: {
    prompt: String,
    model: String,
    parameters: {
      type: Map,
      of: Schema.Types.Mixed
    },
    generationDate: Date
  },
  customProperties: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Video Project Schema
const VideoProjectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
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
  resolution: {
    width: {
      type: Number,
      default: 1920
    },
    height: {
      type: Number,
      default: 1080
    }
  },
  frameRate: {
    type: Number,
    default: 30
  },
  duration: {
    type: Number,
    default: 0
  },
  scenes: [SceneSchema],
  mediaElements: [MediaElementSchema],
  characters: [CharacterSchema],
  audioTracks: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: String,
    startTime: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0
    },
    muted: {
      type: Boolean,
      default: false
    },
    effects: [{
      type: {
        type: String,
        enum: ['reverb', 'delay', 'compression', 'eq', 'ai-enhancement', 'other'],
        required: true
      },
      settings: {
        type: Map,
        of: Schema.Types.Mixed
      },
      enabled: {
        type: Boolean,
        default: true
      }
    }]
  }],
  exportSettings: {
    format: {
      type: String,
      enum: ['mp4', 'mov', 'webm', 'avi', 'gif'],
      default: 'mp4'
    },
    quality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4k'],
      default: '1080p'
    },
    codec: {
      type: String,
      enum: ['h264', 'h265', 'vp9', 'av1'],
      default: 'h264'
    },
    bitrate: {
      type: Number,
      default: 8000000 // 8 Mbps
    }
  },
  aiSettings: {
    videoGeneration: {
      enabled: {
        type: Boolean,
        default: false
      },
      prompt: String,
      model: String,
      parameters: {
        type: Map,
        of: Schema.Types.Mixed
      }
    },
    styleTransfer: {
      enabled: {
        type: Boolean,
        default: false
      },
      referenceStyle: String,
      intensity: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1.0
      }
    },
    autoEditing: {
      enabled: {
        type: Boolean,
        default: false
      },
      style: String,
      intensity: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1.0
      }
    }
  },
  tags: [String],
  coverImage: String,
  exportedFiles: [{
    url: String,
    format: String,
    quality: String,
    duration: Number,
    fileSize: Number,
    resolution: {
      width: Number,
      height: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'archived'],
    default: 'draft'
  },
  lastOpened: {
    type: Date,
    default: Date.now
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

// Virtual for project URL
VideoProjectSchema.virtual('url').get(function() {
  return `/video-projects/${this._id}`;
});

// Method to calculate total duration
VideoProjectSchema.methods.calculateDuration = function() {
  if (!this.scenes || this.scenes.length === 0) {
    this.duration = 0;
    return 0;
  }
  
  const maxEndTime = this.scenes.reduce((max, scene) => {
    const endTime = scene.startTime + scene.duration;
    return endTime > max ? endTime : max;
  }, 0);
  
  this.duration = maxEndTime;
  return maxEndTime;
};

// Method to add a scene
VideoProjectSchema.methods.addScene = function(sceneData) {
  this.scenes.push(sceneData);
  this.calculateDuration();
  return this.save();
};

// Method to remove a scene
VideoProjectSchema.methods.removeScene = function(sceneId) {
  this.scenes = this.scenes.filter(scene => scene._id.toString() !== sceneId.toString());
  
  // Also remove media elements associated with this scene
  this.mediaElements = this.mediaElements.filter(media => 
    !media.sceneId || media.sceneId.toString() !== sceneId.toString()
  );
  
  this.calculateDuration();
  return this.save();
};

// Method to add a media element
VideoProjectSchema.methods.addMediaElement = function(mediaData) {
  this.mediaElements.push(mediaData);
  return this.save();
};

// Method to export project
VideoProjectSchema.methods.export = async function(format, quality) {
  // This would be implemented with actual video processing logic
  this.exportSettings.format = format || this.exportSettings.format;
  this.exportSettings.quality = quality || this.exportSettings.quality;
  
  // Determine resolution based on quality
  let width = 1920;
  let height = 1080;
  
  switch (this.exportSettings.quality) {
    case '480p':
      width = 854;
      height = 480;
      break;
    case '720p':
      width = 1280;
      height = 720;
      break;
    case '1080p':
      width = 1920;
      height = 1080;
      break;
    case '4k':
      width = 3840;
      height = 2160;
      break;
  }
  
  // Placeholder for export logic
  const exportedFile = {
    url: `https://storage.edaivi.com/exports/${this._id}_${Date.now()}.${this.exportSettings.format}`,
    format: this.exportSettings.format,
    quality: this.exportSettings.quality,
    duration: this.duration,
    fileSize: Math.floor(Math.random() * 100000000), // Placeholder
    resolution: {
      width,
      height
    },
    createdAt: new Date()
  };
  
  this.exportedFiles.push(exportedFile);
  this.status = 'completed';
  await this.save();
  
  return exportedFile;
};

// Create model from schema
const VideoProject = mongoose.model('VideoProject', VideoProjectSchema);

module.exports = VideoProject;
