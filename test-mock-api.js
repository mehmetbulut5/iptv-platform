const axios = require('axios');

async function testMockApi() {
  try {
    console.log('Testing mock API...');
    
    // Test authentication
    const authResponse = await axios.get('http://localhost:12000/api/mock?username=testuser&password=testpass');
    console.log('Authentication response:', JSON.stringify(authResponse.data, null, 2));
    
    // Test live categories
    const liveCategoriesResponse = await axios.get('http://localhost:12000/api/mock?action=get_live_categories&username=testuser&password=testpass');
    console.log('Live categories response:', JSON.stringify(liveCategoriesResponse.data, null, 2));
    
    // Test live streams
    const liveStreamsResponse = await axios.get('http://localhost:12000/api/mock?action=get_live_streams&username=testuser&password=testpass');
    console.log('Live streams response:', JSON.stringify(liveStreamsResponse.data, null, 2));
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error testing mock API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMockApi();