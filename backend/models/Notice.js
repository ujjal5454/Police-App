const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
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
      'promotion',
      'transfer notices',
      'directives',
      'rules',
      'exam schedule',
      'order',
      'general notice',
      'law',
      'un notices',
      'deputation',
      'other notice (career)',
      'bipad notice',
      'public procurement',
      'ordinance',
      'procedure'
    ]
  },
  province: {
    type: String,
    enum: [
      'Koshi Province',
      'Madhesh Province',
      'Bagmati Province',
      'Gandaki Province',
      'Lumbini Province',
      'Karnali Province',
      'Sudurpaschim Province',
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
noticeSchema.index({ category: 1, createdAt: -1 });
noticeSchema.index({ province: 1, createdAt: -1 });
noticeSchema.index({ status: 1, createdAt: -1 });
noticeSchema.index({ title: 'text', content: 'text' });

// Update the updatedAt field before saving
noticeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted date
noticeSchema.virtual('formattedDate').get(function() {
  const date = this.createdAt;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// Virtual for Nepali date format (B.S.)
noticeSchema.virtual('nepaliDate').get(function() {
  const date = this.createdAt;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Simple conversion to B.S. (this is a simplified version)
  const bsYear = year + 57; // Approximate conversion
  return `${year}-${month}-${day} (${bsYear}-${month}-${day} B.S)`;
});

// Method to increment views
noticeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment likes
noticeSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Static method to get notices by category
noticeSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ category, status: 'published' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name')
    .exec();
};

// Static method to get recent notices
noticeSchema.statics.getRecent = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name')
    .exec();
};

// Static method to search notices
noticeSchema.statics.searchNotices = function(query, category = null, province = null) {
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

module.exports = mongoose.model('Notice', noticeSchema);
