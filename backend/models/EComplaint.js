const mongoose = require('mongoose');

const eComplaintSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  media: {
    images: [{
      url: String,
      filename: String,
      size: Number
    }],
    audio: [{
      url: String,
      filename: String,
      size: Number
    }],
    video: [{
      url: String,
      filename: String,
      size: Number
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'rejected', 'in_progress', 'resolved'],
    default: 'pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
eComplaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a 2dsphere index for location-based queries
eComplaintSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EComplaint', eComplaintSchema);
