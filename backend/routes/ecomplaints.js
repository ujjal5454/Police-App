const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EComplaint = require('../models/EComplaint');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Configure multer for file uploads (following news.js pattern)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ecomplaints/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ecomplaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, video, and audio files are allowed.'));
    }
  }
});

// @route   POST /api/ecomplaints
// @desc    Create a new e-complaint (following incident pattern exactly)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { type, description, location, media } = req.body;

    // Get user information
    const user = await User.findById(req.user.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const complaintData = {
      type,
      description,
      location,
      media: media || { images: [], audio: [], video: [] },
      reportedBy: user._id
    };

    const eComplaint = new EComplaint(complaintData);
    await eComplaint.save();

    res.status(201).json({
      message: 'E-complaint created successfully',
      complaint: eComplaint
    });

  } catch (error) {
    console.error('Error creating e-complaint:', error);
    res.status(400).json({
      message: 'Error creating e-complaint',
      error: error.message
    });
  }
});

// @route   GET /api/ecomplaints
// @desc    Get e-complaints (following news.js pattern)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id);
    const { status, complaintType, page = 1, limit = 10 } = req.query;

    let query = {};

    // If not admin, only show user's own complaints
    if (user.role !== 'admin') {
      query.userId = user._id;
    }

    // Add filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (complaintType && complaintType !== 'all') {
      query.complaintType = complaintType;
    }

    const skip = (page - 1) * limit;

    const complaints = await EComplaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .exec();

    const total = await EComplaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching e-complaints:', error);
    res.status(500).json({
      message: 'Error fetching e-complaints',
      error: error.message
    });
  }
});

// @route   GET /api/ecomplaints/:id
// @desc    Get a specific e-complaint
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id);
    const complaint = await EComplaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.changedBy', 'name')
      .populate('resolution.resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'E-complaint not found' });
    }

    // Check if user has permission to view this complaint
    if (user.role !== 'admin' && complaint.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read if admin is viewing
    if (user.role === 'admin' && !complaint.isRead) {
      complaint.isRead = true;
      complaint.readBy.push({ user: user._id });
      await complaint.save();
    }

    res.json(complaint);

  } catch (error) {
    console.error('Error fetching e-complaint:', error);
    res.status(500).json({ 
      message: 'Failed to fetch e-complaint',
      error: error.message 
    });
  }
});

// @route   PUT /api/ecomplaints/:id/status
// @desc    Update e-complaint status (admin only)
// @access  Private (Admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status, adminNotes, assignedTo } = req.body;
    
    const complaint = await EComplaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'E-complaint not found' });
    }

    // Update complaint
    complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (assignedTo) complaint.assignedTo = assignedTo;

    // Add to status history
    complaint.statusHistory.push({
      status,
      changedBy: user._id,
      reason: adminNotes
    });

    // If resolving, add resolution info
    if (status === 'resolved') {
      complaint.resolution = {
        description: adminNotes,
        resolvedBy: user._id,
        resolvedAt: new Date(),
        actionTaken: req.body.actionTaken || 'Complaint resolved'
      };
    }

    await complaint.save();

    await complaint.populate([
      { path: 'userId', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.json({
      message: 'E-complaint status updated successfully',
      complaint
    });

  } catch (error) {
    console.error('Error updating e-complaint status:', error);
    res.status(500).json({ 
      message: 'Failed to update e-complaint status',
      error: error.message 
    });
  }
});

// @route   GET /api/ecomplaints/stats/overview
// @desc    Get e-complaint statistics (admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const stats = await EComplaint.getStatistics();
    
    res.json(stats);

  } catch (error) {
    console.error('Error fetching e-complaint statistics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
});

// @route   DELETE /api/ecomplaints/:id
// @desc    Delete an e-complaint
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id);
    const complaint = await EComplaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'E-complaint not found' });
    }

    // Check permissions
    if (user.role !== 'admin' && complaint.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated files
    const deleteFiles = (files) => {
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    };

    if (complaint.media) {
      if (complaint.media.images) deleteFiles(complaint.media.images);
      if (complaint.media.audio) deleteFiles(complaint.media.audio);
      if (complaint.media.video) deleteFiles(complaint.media.video);
    }

    await EComplaint.findByIdAndDelete(req.params.id);

    res.json({ message: 'E-complaint deleted successfully' });

  } catch (error) {
    console.error('Error deleting e-complaint:', error);
    res.status(500).json({ 
      message: 'Failed to delete e-complaint',
      error: error.message 
    });
  }
});

module.exports = router;
