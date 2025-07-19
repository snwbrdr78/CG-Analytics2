const axios = require('axios');

// Fresh token with correct JWT secret
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNlY2E2ZGQyLTg3NDItNDE0Yi04MTg5LTE3NDMxMGU2MjdhNiIsImVtYWlsIjoiaW5mb0Bjb21lZHlnZW5pLnVzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUyODkxOTY1LCJleHAiOjE3NTM0OTY3NjV9.VMVwfX8s3uBJHyFTi9sjIdLXRHS1N9FCXo8KfcO5ND0';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

async function testEndpoints() {
  const endpoints = [
    '/analytics/top-posts',
    '/analytics/dashboard',
    '/analytics/earnings-timeline',
    '/posts',
    '/artists'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      const response = await api.get(endpoint);
      console.log(`✓ Success: ${response.status}`);
      console.log(`Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log(`✗ Error: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log(`Details: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
}

testEndpoints();