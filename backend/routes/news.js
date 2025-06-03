const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/news/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
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

// GET /api/news - Get all published news (public)
router.get('/', async (req, res) => {
  try {
    const { category, province, search, page = 1, limit = 10 } = req.query;
    
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
    
    const skip = (page - 1) * limit;
    
    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .exec();
    
    const total = await News.countDocuments(query);
    
    res.json({
      news,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

// GET /api/news/categories - Get all categories with news count
router.get('/categories', async (req, res) => {
  try {
    const categories = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET /api/news/recent - Get recent news
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await News.getRecent(parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent news', error: error.message });
  }
});

// GET /api/news/:id - Get single news article
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    // Increment views
    await news.incrementViews();
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news article', error: error.message });
  }
});

// POST /api/news - Create new news (Admin only)
router.post('/', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, province, status, priority } = req.body;
    
    const newsData = {
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
      newsData.image = {
        url: `/uploads/news/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size
      };
    }
    
    const news = new News(newsData);
    await news.save();
    
    // Populate the created news
    await news.populate('createdBy', 'name');
    
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Error creating news', error: error.message });
  }
});

// PUT /api/news/:id - Update news (Admin only)
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
        url: `/uploads/news/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size
      };
    }
    
    const news = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name').populate('updatedBy', 'name');
    
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.json(news);
  } catch (error) {
    res.status(400).json({ message: 'Error updating news', error: error.message });
  }
});

// DELETE /api/news/:id - Delete news (Admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news', error: error.message });
  }
});

// POST /api/news/:id/like - Like a news article
router.post('/:id/like', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    await news.incrementLikes();
    
    res.json({ likes: news.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking news', error: error.message });
  }
});

// GET /api/news/admin/all - Get all news for admin (including drafts)
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
    
    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .exec();
    
    const total = await News.countDocuments(query);
    
    res.json({
      news,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin news', error: error.message });
  }
});

module.exports = router;
