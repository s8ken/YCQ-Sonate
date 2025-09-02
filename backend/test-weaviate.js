const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aitkenstephen_db_user:659bJo5O3wDNUXys@cluster0.aubxbwz.mongodb.net/';

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (you may need to create a test user first)
const TEST_USER = {
  email: 'weaviate-test@example.com',
  password: 'testpass123'
};

let authToken = null;

async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.data.token;
    console.log('✅ Authentication successful');
    console.log('🔑 Token received:', authToken ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.log('⚠️  Authentication failed:', error.response?.data || error.message);
    console.log('ℹ️  Note: You may need to create a test user first');
    return false;
  }
}

function getAuthHeaders() {
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  console.log('📤 Sending headers:', Object.keys(headers).length > 0 ? 'With Authorization' : 'No Authorization');
  return headers;
}

async function testWeaviateIntegration() {
  console.log('🧪 Testing Weaviate Integration...');
  
  // First authenticate
  console.log('0. Authenticating...');
  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  let testContextId = null;

  // Test 1: Check Weaviate status
  console.log('\n1. Checking Weaviate status...');
  try {
    const statusResponse = await axios.get(`${BASE_URL}/context/weaviate/status`, {
      headers: getAuthHeaders()
    });
    console.log('✅ Weaviate Status:', statusResponse.data);
  } catch (error) {
    console.log('⚠️  Weaviate Status Check Failed:', error.response?.data || error.message);
  }

  // Test 2: Initialize Weaviate schema
  console.log('\n2. Initializing Weaviate schema...');
  try {
    const initResponse = await axios.post(`${BASE_URL}/context/weaviate/init`, {}, {
      headers: getAuthHeaders()
    });
    console.log('✅ Schema Initialization:', initResponse.data);
  } catch (error) {
    console.log('⚠️  Schema Initialization Failed:', error.response?.data || error.message);
  }

  // Test 3: Create a test context
  console.log('\n3. Creating test context...');
  const testContext = {
    tag: 'test-weaviate',
    source: 'symbi',
    content: 'This is a test context for Weaviate integration with semantic search capabilities',
    data: {
      testField: 'test value',
      category: 'integration-test'
    },
    trustScore: 4.5,
    conversationId: 'test-conv-123',
    agentId: 'test-agent-456'
  };
  
  try {
    const createResponse = await axios.post(`${BASE_URL}/context`, testContext, {
      headers: getAuthHeaders()
    });
    console.log('✅ Context Created:', {
      id: createResponse.data._id,
      tag: createResponse.data.tag,
      weaviateId: createResponse.data.weaviateId,
      vectorized: createResponse.data.vectorized
    });
    testContextId = createResponse.data._id;
  } catch (error) {
    console.log('⚠️  Context Creation Failed:', error.response?.data || error.message);
  }

  // Test 4: Perform semantic search
  console.log('\n4. Testing semantic search...');
  try {
    const searchResponse = await axios.post(`${BASE_URL}/context/search`, {
      query: 'test context weaviate integration',
      limit: 5,
      threshold: 0.7
    }, {
      headers: getAuthHeaders()
    });
    console.log('✅ Semantic Search Results:', searchResponse.data);
  } catch (error) {
    console.log('⚠️  Semantic Search Failed:', error.response?.data || error.message);
  }

  // Test 5: Get bridge recommendations
  console.log('\n5. Testing bridge recommendations...');
  try {
    const recommendationsResponse = await axios.post(`${BASE_URL}/context/recommendations`, {
      contextId: testContextId,
      limit: 3
    }, {
      headers: getAuthHeaders()
    });
    console.log('✅ Bridge Recommendations:', recommendationsResponse.data);
  } catch (error) {
    console.log('⚠️  Bridge Recommendations Failed:', error.response?.data || error.message);
  }

  // Test 6: Sync contexts to Weaviate
  console.log('\n6. Testing context synchronization...');
  try {
    const syncResponse = await axios.post(`${BASE_URL}/context/weaviate/sync`, {}, {
      headers: getAuthHeaders()
    });
    console.log('✅ Context Synchronization:', syncResponse.data);
  } catch (error) {
    console.log('⚠️  Context Synchronization Failed:', error.response?.data || error.message);
  }

  // Cleanup: Delete test context
  if (testContextId) {
    console.log('\n7. Cleaning up test context...');
    try {
      await axios.delete(`${BASE_URL}/context/${testContextId}`, {
        headers: getAuthHeaders()
      });
      console.log('✅ Test context cleaned up');
    } catch (error) {
      console.log('⚠️  Cleanup failed:', error.response?.data || error.message);
    }
  }

  console.log('\n🏁 Weaviate Integration Test Complete!');
}

testWeaviateIntegration();