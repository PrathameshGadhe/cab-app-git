const axios = require('axios');

// Test the GET /api/company endpoint
async function testGetCompanies() {
  try {
    const response = await axios.get('http://localhost:5000/api/company');
    console.log('Response status:', response.status);
    console.log('Companies:', response.data);
  } catch (error) {
    console.error('Error testing endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGetCompanies();
