/**
 * EdAiVi Studio - Audio Project Model
 * 
 * This model represents an audio project in the EdAiVi Studio platform.
 * It includes metadata, processing settings, and references to audio files.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AudioTrackSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Track name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['vocal', 'instrument', 'beat', 'effect', 'ai-generated', 'other'],
    default: 'other'
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  waveformUrl: String,
  duration: {
    type: Number,
    default: 0
  },
  startTime: {
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
  solo: {
    type: Boolean,
    default: false
  },
  effects: [{
    type: {
      type: String,
      enum: ['reverb', 'delay', 'compression', 'eq', 'distortion', 'ai-enhancement', 'other'],
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
  }],
  metadata: {
    originalFilename: String,
    fileSize: Number,
    format: String,
    bitrate: Number,
    sampleRate: Number,
    channels: Number,
    bpm: Number,
    key: String,
    tags: [String]
  },
  aiMetadata: {
    model: String,
    prompt: String,
    parameters: {
      type: Map,
      of: Schema.Types.Mixed
    },
    generationDate: Date
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

const AudioProjectSchema = new Schema({
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
  tracks: [AudioTrackSchema],
  masterSettings: {
    volume: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0
    },
    effects: [{
      type: {
        type: String,
        enum: ['reverb', 'delay', 'compression', 'eq', 'limiter', 'ai-mastering', 'other'],
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
  },
  exportSettings: {
    format: {
      type: String,
      enum: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
      default: 'mp3'
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'ultra'],
      default: 'high'
    },
    normalization: {
      type: Boolean,
      default: true
    }
  },
  duration: {
    type: Number,
    default: 0
  },
  bpm: {
    type: Number,
    default: 120
  },
  key: String,
  tags: [String],
  coverImage: String,
  exportedFiles: [{
    url: String,
    format: String,
    quality: String,
    duration: Number,
    fileSize: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiSettings: {
    voiceCloning: {
      enabled: {
        type: Boolean,
        default: false
      },
      referenceAudio: String,
      model: String
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
    autoMastering: {
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
AudioProjectSchema.virtual('url').get(function() {
  return `/audio-projects/${this._id}`;
});

// Method to calculate total duration
AudioProjectSchema.methods.calculateDuration = function() {
  if (!this.tracks || this.tracks.length === 0) {
    this.duration = 0;
    return 0;
  }
  
  const maxEndTime = this.tracks.reduce((max, track) => {
    const endTime = track.startTime + track.duration;
    return endTime > max ? endTime : max;
  }, 0);
  
  this.duration = maxEndTime;
  return maxEndTime;
};

// Method to add a track
AudioProjectSchema.methods.addTrack = function(trackData) {
  this.tracks.push(trackData);
  this.calculateDuration();
  return this.save();
};

// Method to remove a track
AudioProjectSchema.methods.removeTrack = function(trackId) {
  this.tracks = this.tracks.filter(track => track._id.toString() !== trackId.toString());
  this.calculateDuration();
  return this.save();
};

// Method to update a track
AudioProjectSchema.methods.updateTrack = function(trackId, trackData) {
  const trackIndex = this.tracks.findIndex(track => track._id.toString() === trackId.toString());
  
  if (trackIndex === -1) {
    throw new Error('Track not found');
  }
  
  this.tracks[trackIndex] = { ...this.tracks[trackIndex].toObject(), ...trackData };
  this.calculateDuration();
  return this.save();
};

// Method to export project
AudioProjectSchema.methods.export = async function(format, quality) {
  // This would be implemented with actual audio processing logic
  this.exportSettings.format = format || this.exportSettings.format;
  this.exportSettings.quality = quality || this.exportSettings.quality;
  
  // Placeholder for export logic
  const exportedFile = {
    url: `https://storage.edaivi.com/exports/${this._id}_${Date.now()}.${this.exportSettings.format}`,
    format: this.exportSettings.format,
    quality: this.exportSettings.quality,
    duration: this.duration,
    fileSize: Math.floor(Math.random() * 10000000), // Placeholder
    createdAt: new Date()
  };
  
  this.exportedFiles.push(exportedFile);
  this.status = 'completed';
  await this.save();
  
  return exportedFile;
};

// Create model from schema
const AudioProject = mongoose.model('AudioProject', AudioProjectSchema);

module.exports = AudioProject;
