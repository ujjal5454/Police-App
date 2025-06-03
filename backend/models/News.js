const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'fire',
      'cyber crime',
      'informative',
      'harmful weapon',
      'flood landslide',
      'organizational program',
      'gambling',
      'dead bodies found',
      'rape',
      'home ministry program',
      'narcotic',
      'igp program',
      'blackmailing',
      'quarrel/disturbance',
      'bribery',
      'drug',
      'violence',
      'suspicious thing',
      'crime report',
      'burglary',
      'pick pocketing',
      'harassment',
      'illegal trading',
      'police day program',
      'misbehaviour',
      'robbery',
      'public gathering',
      'crime(arrest)',
      'human trafficking',
      'miscellaneous'
    ]
  },
  province: {
    type: String,
    enum: [
      'Province 1',
      'Madhesh Province',
      'Bagmati Province',
      'Gandaki Province',
      'Lumbini Province',
      'Karnali Province',
      'Sudurpashchim Province',
      'All Provinces'
    ],
    default: 'All Provinces'
  },
  image: {
    url: String,
    filename: String,
    size: Number
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
newsSchema.index({ category: 1, createdAt: -1 });
newsSchema.index({ province: 1, createdAt: -1 });
newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ title: 'text', content: 'text' });

// Update the updatedAt field before saving
newsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted date
newsSchema.virtual('formattedDate').get(function() {
  const date = this.createdAt;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// Virtual for Nepali date format (B.S.)
newsSchema.virtual('nepaliDate').get(function() {
  const date = this.createdAt;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Simple conversion to B.S. (this is a simplified version)
  // In a real application, you'd use a proper Nepali date conversion library
  const bsYear = year + 57; // Approximate conversion
  return `${year}-${month}-${day} (${bsYear}-${month}-${day} B.S)`;
});

// Method to increment views
newsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment likes
newsSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Static method to get news by category
newsSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ category, status: 'published' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name')
    .exec();
};

// Static method to get recent news
newsSchema.statics.getRecent = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name')
    .exec();
};

// Static method to search news
newsSchema.statics.searchNews = function(query, category = null, province = null) {
  const searchCriteria = {
    status: 'published',
    $text: { $search: query }
  };
  
  if (category) {
    searchCriteria.category = category;
  }
  
  if (province && province !== 'All Provinces') {
    searchCriteria.province = province;
  }
  
  return this.find(searchCriteria)
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .populate('createdBy', 'name')
    .exec();
};

module.exports = mongoose.model('News', newsSchema);
