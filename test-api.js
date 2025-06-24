// Test script to check if the e-complaint API endpoint is working
const axios = require('axios');

async function testEComplaintAPI() {
  try {
    console.log('Testing e-complaint API endpoint...');
    
    // Test if the server is running
    const healthCheck = await axios.get('http://localhost:5000/api/auth/check-auth', {
      withCredentials: true
    }).catch(err => {
      console.log('Auth endpoint response:', err.response?.status || 'No response');
      return { status: err.response?.status || 'No response' };
    });
    
    console.log('Server health check:', healthCheck.status);
    
    // Test the e-complaint endpoint (should get 401 unauthorized since we're not logged in)
    const testData = {
      type: 'Police Service Not Received',
      description: 'Test complaint',
      location: {
        type: 'Point',
        coordinates: [27.7172, 85.3240],
        address: 'Test Location'
      },
      media: {
        images: [],
        audio: [],
        video: []
      }
    };
    
    const response = await axios.post('http://localhost:5000/api/ecomplaints', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    }).catch(err => {
      console.log('E-complaint endpoint response:', err.response?.status, err.response?.data?.message || err.message);
      return { status: err.response?.status, data: err.response?.data };
    });
    
    console.log('E-complaint API test result:', response.status, response.data?.message || 'Success');
    
    if (response.status === 401) {
      console.log('✅ API endpoint is working! (401 = needs authentication, which is expected)');
    } else if (response.status === 404) {
      console.log('❌ API endpoint not found (404)');
    } else {
      console.log('✅ API endpoint responded with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testEComplaintAPI();
