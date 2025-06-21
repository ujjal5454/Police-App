const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  profilePhoto: {
    type: String,
    trim: true
  },
  address: {
    province: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    municipality: {
      type: String,
      trim: true
    },
    wardNo: {
      type: String,
      trim: true
    },
    houseNo: {
      type: String,
      trim: true
    },
    street: {
      type: String,
      trim: true
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 