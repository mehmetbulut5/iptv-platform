#!/usr/bin/env node

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:12001'; // Change to your local development server port
const MOCK_API_URL = `${BASE_URL}/api/mock`;

// Test cases
const tests = [
  {
    name: 'Authentication',
    url: `${MOCK_API_URL}?username=test&password=test`,
    validate: (data) => data?.user_info?.auth === 1
  },
  {
    name: 'Live Categories',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_live_categories`,
    validate: (data) => Array.isArray(data) && data.length > 0
  },
  {
    name: 'Live Streams',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_live_streams`,
    validate: (data) => Array.isArray(data) && data.length > 0
  },
  {
    name: 'Live Streams by Category',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_live_streams&category_id=1`,
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(stream => stream.category_id === '1')
  },
  {
    name: 'Movie Categories',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_vod_categories`,
    validate: (data) => Array.isArray(data) && data.length > 0
  },
  {
    name: 'Movies',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_vod_streams`,
    validate: (data) => Array.isArray(data) && data.length > 0
  },
  {
    name: 'Movies by Category',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_vod_streams&category_id=10`,
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(movie => movie.category_id === '10')
  },
  {
    name: 'Series Categories',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_series_categories`,
    validate: (data) => Array.isArray(data) && data.length > 0
  },
  {
    name: 'Series',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_series`,
    validate: (data) => Array.isArray(data) && data.length > 0
  },
  {
    name: 'Series by Category',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_series&category_id=20`,
    validate: (data) => Array.isArray(data) && data.length > 0 && data.every(series => series.category_id === '20')
  },
  {
    name: 'Series Info',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_series_info&series_id=201`,
    validate: (data) => data?.info?.name && data?.episodes && Object.keys(data.episodes).length > 0
  },
  {
    name: 'EPG',
    url: `${MOCK_API_URL}?username=test&password=test&action=get_short_epg`,
    validate: (data) => data?.epg_listings && Array.isArray(data.epg_listings) && data.epg_listings.length > 0
  },
  {
    name: 'Stream Request - Live',
    url: `${MOCK_API_URL}?stream_id=1&stream_type=live`,
    expectRedirect: true
  },
  {
    name: 'Stream Request - Movie',
    url: `${MOCK_API_URL}?stream_id=101&stream_type=movie`,
    expectRedirect: true
  },
  {
    name: 'Stream Request - Series',
    url: `${MOCK_API_URL}?stream_id=201-1-1&stream_type=series`,
    expectRedirect: true
  }
];

// Run tests
async function runTests() {
  console.log('Testing Mock API...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const response = await axios.get(test.url, {
        maxRedirects: 0,
        validateStatus: (status) => {
          if (test.expectRedirect) {
            return status >= 200 && status < 400;
          }
          return status === 200;
        }
      });
      
      if (test.expectRedirect) {
        const isRedirect = response.status >= 300 && response.status < 400;
        if (isRedirect) {
          console.log(`PASS: ${test.name}: Redirect successful to ${response.headers.location}`);
          passed++;
        } else {
          console.log(`FAIL: ${test.name}: Expected redirect but got status ${response.status}`);
          failed++;
        }
      } else if (test.validate(response.data)) {
        console.log(`PASS: ${test.name}`);
        passed++;
      } else {
        console.log(`FAIL: ${test.name}: Failed validation`);
        console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        failed++;
      }
    } catch (error) {
      if (test.expectRedirect && error.response && error.response.status >= 300 && error.response.status < 400) {
        console.log(`PASS: ${test.name}: Redirect successful to ${error.response.headers.location}`);
        passed++;
      } else {
        console.log(`FAIL: ${test.name}: Error - ${error.message}`);
        if (error.response) {
          console.log(`Status: ${error.response.status}`);
          console.log('Response:', JSON.stringify(error.response.data, null, 2).substring(0, 200) + '...');
        }
        failed++;
      }
    }
    console.log('---');
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests();