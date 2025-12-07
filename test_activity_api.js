// Test script to check activity feed API
const fetch = require('node-fetch');

async function testActivityAPI() {
  try {
    const response = await fetch('https://www.mindfulchampion.com/api/admin/analytics/activity-feed');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testActivityAPI();
