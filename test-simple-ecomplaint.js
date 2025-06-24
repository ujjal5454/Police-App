// Simple test to create e-complaint in MongoDB (following news.js pattern)
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const EComplaint = require('./backend/models/EComplaint');
const User = require('./backend/models/User');

async function createTestEComplaint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/police_db');
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'user'
      });
      await testUser.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Using existing test user');
    }

    // Create e-complaint (following the exact structure from news.js)
    const complaintData = {
      userId: testUser._id,
      userEmail: testUser.email,
      userName: testUser.name,
      description: 'Test e-complaint: Police service was not received when requested. This is a test complaint to verify database integration.',
      complaintType: 'Police Service Not Received',
      location: {
        address: 'Kathmandu, Bagmati Province, Nepal',
        coordinates: [85.3240, 27.7172]
      },
      submissionInfo: {
        submittedFrom: 'web',
        platform: 'Node.js Test',
        language: 'en',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script'
      }
    };

    const eComplaint = new EComplaint(complaintData);
    await eComplaint.save();

    console.log('✅ E-complaint created successfully!');
    console.log('📋 Details:');
    console.log(`   - ID: ${eComplaint._id}`);
    console.log(`   - Complaint Number: ${eComplaint.complaintNumber}`);
    console.log(`   - Status: ${eComplaint.status}`);
    console.log(`   - Priority: ${eComplaint.priority}`);
    console.log(`   - User: ${eComplaint.userName}`);
    console.log(`   - Type: ${eComplaint.complaintType}`);
    console.log(`   - Created: ${eComplaint.createdAt}`);

    // Verify collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const eComplaintCollection = collections.find(col => col.name === 'ecomplaints');
    
    if (eComplaintCollection) {
      console.log('✅ ecomplaints collection exists in MongoDB');
      
      // Count documents
      const count = await EComplaint.countDocuments();
      console.log(`📊 Total e-complaints in database: ${count}`);
    }

    // Test querying
    const allComplaints = await EComplaint.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`📝 Recent complaints (${allComplaints.length}):`);
    allComplaints.forEach((complaint, index) => {
      console.log(`   ${index + 1}. ${complaint.complaintNumber} - ${complaint.complaintType} (${complaint.status})`);
    });

    console.log('\n🎉 E-complaint database integration successful!');
    console.log('💡 You can now submit e-complaints from the frontend and they will be saved to MongoDB.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
createTestEComplaint();
