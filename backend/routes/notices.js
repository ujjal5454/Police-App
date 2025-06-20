const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/notices/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'notice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/notices - Get all published notices (public)
router.get('/', async (req, res) => {
  try {
    const { category, province, search, page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = { status: 'published' };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add province filter
    if (province && province !== 'All Provinces') {
      query.province = province;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const skip = (page - 1) * limit;
    
    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .exec();
    
    const total = await Notice.countDocuments(query);
    
    res.json({
      notices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
});

// GET /api/notices/categories - Get all categories with notice count
router.get('/categories', async (req, res) => {
  try {
    const categories = await Notice.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET /api/notices/recent - Get recent notices
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const notices = await Notice.getRecent(parseInt(limit));
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent notices', error: error.message });
  }
});

// GET /api/notices/:id - Get single notice
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Increment views
    await notice.incrementViews();
    
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice', error: error.message });
  }
});

// POST /api/notices - Create new notice (Admin only)
router.post('/', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, province, status, priority } = req.body;
    
    const noticeData = {
      title,
      content,
      category,
      province: province || 'All Provinces',
      status: status || 'published',
      priority: priority || 'medium',
      createdBy: req.user.user.id
    };
    
    // Add image if uploaded
    if (req.file) {
      noticeData.image = {
        url: `/uploads/notices/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size
      };
    }
    
    const notice = new Notice(noticeData);
    await notice.save();
    
    // Populate the created notice
    await notice.populate('createdBy', 'name');
    
    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Error creating notice', error: error.message });
  }
});

// PUT /api/notices/:id - Update notice (Admin only)
router.put('/:id', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, province, status, priority } = req.body;
    
    const updateData = {
      title,
      content,
      category,
      province,
      status,
      priority,
      updatedBy: req.user.user.id
    };
    
    // Add image if uploaded
    if (req.file) {
      updateData.image = {
        url: `/uploads/notices/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size
      };
    }
    
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name').populate('updatedBy', 'name');
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Error updating notice', error: error.message });
  }
});

// DELETE /api/notices/:id - Delete notice (Admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice', error: error.message });
  }
});

// POST /api/notices/:id/like - Like a notice
router.post('/:id/like', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.incrementLikes();

    res.json({ likes: notice.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking notice', error: error.message });
  }
});

// POST /api/notices/:id/unlike - Unlike a notice
router.post('/:id/unlike', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Decrement likes but don't go below 0
    notice.likes = Math.max(0, notice.likes - 1);
    await notice.save();

    res.json({ likes: notice.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking notice', error: error.message });
  }
});

// GET /api/notices/admin/all - Get all notices for admin (including drafts)
router.get('/admin/all', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .exec();
    
    const total = await Notice.countDocuments(query);
    
    res.json({
      notices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin notices', error: error.message });
  }
});

module.exports = router;
