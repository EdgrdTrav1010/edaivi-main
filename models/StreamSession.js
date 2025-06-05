/**
 * EdAiVi Studio - Stream Session Model
 * 
 * This model represents a streaming session in the EdAiVi Studio platform.
 * It includes metadata, streaming settings, and viewer analytics.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Chat Message Schema
const ChatMessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['text', 'emote', 'donation', 'subscription', 'system', 'moderation'],
    default: 'text'
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationReason: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Stream Event Schema
const StreamEventSchema = new Schema({
  type: {
    type: String,
    enum: [
      'stream_start', 'stream_end', 'stream_pause', 'stream_resume',
      'viewer_join', 'viewer_leave', 'donation', 'subscription',
      'milestone', 'technical_issue', 'custom'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: String
}, {
  timestamps: true
});

// Stream Session Schema
const StreamSessionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Stream title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Stream owner is required']
  },
  moderators: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: Map,
      of: Boolean
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isRecorded: {
    type: Boolean,
    default: true
  },
  scheduledStartTime: Date,
  actualStartTime: Date,
  endTime: Date,
  duration: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'paused', 'ended', 'archived', 'cancelled'],
    default: 'scheduled'
  },
  category: {
    type: String,
    enum: ['music', 'gaming', 'art', 'talk', 'education', 'technology', 'other'],
    default: 'other'
  },
  tags: [String],
  thumbnailUrl: String,
  recordingUrl: String,
  streamKey: {
    type: String,
    select: false // Don't include stream key in query results by default
  },
  streamUrls: {
    rtmp: String,
    hls: String,
    webRTC: String,
    dash: String
  },
  settings: {
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
    bitrate: {
      type: Number,
      default: 6000 // in kbps
    },
    codec: {
      type: String,
      enum: ['h264', 'h265', 'vp9', 'av1'],
      default: 'h264'
    },
    audioSettings: {
      codec: {
        type: String,
        enum: ['aac', 'opus', 'mp3'],
        default: 'aac'
      },
      bitrate: {
        type: Number,
        default: 160 // in kbps
      },
      sampleRate: {
        type: Number,
        default: 48000 // in Hz
      },
      channels: {
        type: Number,
        default: 2
      }
    }
  },
  chatSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    moderationLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'medium'
    },
    slowMode: {
      enabled: {
        type: Boolean,
        default: false
      },
      delay: {
        type: Number,
        default: 5 // in seconds
      }
    },
    followersOnly: {
      type: Boolean,
      default: false
    },
    subscribersOnly: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    viewerCounts: [{
      count: Number,
      timestamp: Date
    }],
    peakViewers: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    uniqueViewers: {
      type: Number,
      default: 0
    },
    chatStats: {
      totalMessages: {
        type: Number,
        default: 0
      },
      uniqueChatters: {
        type: Number,
        default: 0
      }
    }
  },
  events: [StreamEventSchema],
  chat: [ChatMessageSchema],
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

// Virtual for stream URL
StreamSessionSchema.virtual('url').get(function() {
  return `/streams/${this._id}`;
});

// Method to start stream
StreamSessionSchema.methods.startStream = function() {
  this.status = 'live';
  this.actualStartTime = new Date();
  
  // Add stream start event
  this.events.push({
    type: 'stream_start',
    timestamp: this.actualStartTime,
    description: 'Stream started'
  });
  
  return this.save();
};

// Method to end stream
StreamSessionSchema.methods.endStream = function() {
  this.status = 'ended';
  this.endTime = new Date();
  
  // Calculate duration
  if (this.actualStartTime) {
    this.duration = Math.floor((this.endTime - this.actualStartTime) / 1000);
  }
  
  // Add stream end event
  this.events.push({
    type: 'stream_end',
    timestamp: this.endTime,
    description: 'Stream ended'
  });
  
  return this.save();
};

// Method to add chat message
StreamSessionSchema.methods.addChatMessage = function(messageData) {
  this.chat.push(messageData);
  
  // Update chat stats
  this.analytics.chatStats.totalMessages += 1;
  
  return this.save();
};

// Method to update viewer count
StreamSessionSchema.methods.updateViewerCount = function(count) {
  const timestamp = new Date();
  
  this.analytics.viewerCounts.push({
    count,
    timestamp
  });
  
  // Update peak viewers if necessary
  if (count > this.analytics.peakViewers) {
    this.analytics.peakViewers = count;
  }
  
  return this.save();
};

// Create model from schema
const StreamSession = mongoose.model('StreamSession', StreamSessionSchema);

module.exports = StreamSession;
