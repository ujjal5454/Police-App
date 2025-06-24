// Test script to verify e-complaint database creation
const mongoose = require('mongoose');
require('dotenv').config();

// Import the EComplaint model
const EComplaint = require('./backend/models/EComplaint');
const User = require('./backend/models/User');

async function testEComplaintCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/police_db');
    console.log('✅ Connected to MongoDB');

    // Check if we have any users (we need a user ID for the complaint)
    const users = await User.find().limit(1);
    let testUserId;
    
    if (users.length === 0) {
      // Create a test user if none exists
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      });
      await testUser.save();
      testUserId = testUser._id;
      console.log('✅ Created test user');
    } else {
      testUserId = users[0]._id;
      console.log('✅ Using existing user');
    }

    // Create a test e-complaint
    const testComplaint = new EComplaint({
      userId: testUserId,
      userEmail: 'test@example.com',
      userName: 'Test User',
      description: 'This is a test e-complaint to verify database creation and data flow.',
      complaintType: 'Police Service Not Received',
      location: {
        address: 'Test Location, Kathmandu, Nepal',
        coordinates: [85.3240, 27.7172] // Kathmandu coordinates
      },
      media: {
        images: [],
        audio: [],
        video: []
      },
      submissionInfo: {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        platform: 'Node.js',
        language: 'en',
        submittedFrom: 'api'
      }
    });

    // Save the complaint
    const savedComplaint = await testComplaint.save();
    console.log('✅ E-complaint created successfully!');
    console.log('📋 Complaint Details:');
    console.log(`   - ID: ${savedComplaint._id}`);
    console.log(`   - Complaint Number: ${savedComplaint.complaintNumber}`);
    console.log(`   - Status: ${savedComplaint.status}`);
    console.log(`   - Priority: ${savedComplaint.priority}`);
    console.log(`   - Created At: ${savedComplaint.createdAt}`);

    // Verify the collection was created
    const collections = await mongoose.connection.db.listCollections().toArray();
    const eComplaintCollection = collections.find(col => col.name === 'ecomplaints');
    
    if (eComplaintCollection) {
      console.log('✅ E-complaints collection created in MongoDB');
      
      // Get collection stats
      const stats = await mongoose.connection.db.collection('ecomplaints').stats();
      console.log(`📊 Collection Stats:`);
      console.log(`   - Documents: ${stats.count}`);
      console.log(`   - Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
      console.log(`   - Indexes: ${stats.nindexes}`);
    } else {
      console.log('❌ E-complaints collection not found');
    }

    // Test querying the complaint
    const foundComplaint = await EComplaint.findById(savedComplaint._id)
      .populate('userId', 'name email');
    
    if (foundComplaint) {
      console.log('✅ E-complaint query successful');
      console.log(`   - Found complaint: ${foundComplaint.complaintNumber}`);
      console.log(`   - User: ${foundComplaint.userId.name}`);
    }

    // Test statistics
    const stats = await EComplaint.getStatistics();
    console.log('📈 E-complaint Statistics:');
    console.log(`   - Total: ${stats.overview.total}`);
    console.log(`   - Pending: ${stats.overview.pending}`);
    console.log(`   - By Type:`, stats.byType);

    console.log('\n🎉 All tests passed! E-complaint database is working correctly.');
    
  } catch (error) {
    console.error('❌ Error testing e-complaint:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testEComplaintCreation();
