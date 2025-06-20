const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const auth = require('../middleware/auth');

// Create a new incident
router.post('/', auth, async (req, res) => {
  try {
    // Get the logged-in user ID from the auth middleware
    const userId = req.user.user.id;

    // Create incident with the authenticated user as reportedBy
    const incidentData = {
      ...req.body,
      reportedBy: userId
    };

    const incident = new Incident(incidentData);
    await incident.save();

    // Populate the user details for the response
    await incident.populate('reportedBy', 'name email phone address province district municipality');

    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: 'Error creating incident', error: error.message });
  }
});

// Get incidents - all for admin, user's own for regular users
router.get('/', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.user.id);

    let incidents;
    if (user && user.role === 'admin') {
      // Admin sees all incidents with full user details
      incidents = await Incident.find({})
        .populate('reportedBy', 'name email phone address province district municipality')
        .sort({ createdAt: -1 });
    } else {
      // Regular users see only their own incidents
      incidents = await Incident.find({ reportedBy: req.user.user.id })
        .sort({ createdAt: -1 });
    }

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
});

// Get a single incident
router.get('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('reportedBy', 'name email phone address province district municipality');
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incident', error: error.message });
  }
});

// Update an incident
router.put('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(400).json({ message: 'Error updating incident', error: error.message });
  }
});

// Admin: Update incident status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    // Check if user is admin (you can modify this check based on your user model)
    const User = require('../models/User');
    const user = await User.findById(req.user.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Validate status
    const validStatuses = ['pending', 'acknowledged', 'rejected', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error updating incident status', error: error.message });
  }
});

// Delete an incident
router.delete('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting incident', error: error.message });
  }
});

module.exports = router; 