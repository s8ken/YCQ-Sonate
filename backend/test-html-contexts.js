const axios = require('axios');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aitkenstephen_db_user:659bJo5O3wDNUXys@cluster0.aubxbwz.mongodb.net/';

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';

// Helper function to get auth headers
function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📤 Sending headers: With Authorization');
  } else {
    console.log('📤 Sending headers: No Authorization');
  }
  
  return headers;
}

// Test functions
async function authenticate() {
  try {
    console.log('🔐 Authenticating...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Authentication successful');
      console.log('Token received:', authToken ? 'Yes' : 'No');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

async function testContextSearch() {
  try {
    console.log('\n🔍 Testing context search for uploaded HTML content...');
    
    const searchQueries = [
      'AI ethics research',
      'SYMBI interaction',
      'collaboration'
    ];
    
    for (const query of searchQueries) {
      console.log(`\n--- Searching for: "${query}" ---`);
      
      const response = await axios.get(`${BASE_URL}/context/search`, {
        params: { query, limit: 5 },
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        const contexts = response.data.data;
        console.log(`✅ Found ${contexts.length} contexts`);
        
        contexts.forEach((context, index) => {
          console.log(`${index + 1}. ${context.data?.title || context.title || 'Untitled'}`);
          console.log(`   Tag: ${context.tag || 'N/A'}`);
          console.log(`   Content length: ${context.data?.content?.length || context.content?.length || 0} chars`);
          console.log(`   ID: ${context._id}`);
        });
      } else {
        console.log('⚠️  Search failed:', response.data);
      }
    }
  } catch (error) {
    console.error('❌ Context search failed:', error.response?.data || error.message);
  }
}

async function testSemanticSearch() {
  try {
    console.log('\n🧠 Testing semantic search with Weaviate...');
    
    const response = await axios.post(`${BASE_URL}/context/semantic-search`, {
      query: 'artificial intelligence ethics and research',
      limit: 3
    }, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      const results = response.data.data;
      console.log(`✅ Semantic search found ${results.length} results`);
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.data?.title || result.title || 'Untitled'}`);
        console.log(`   Similarity: ${result.similarity || 'N/A'}`);
        console.log(`   Tag: ${result.tag || 'N/A'}`);
      });
    } else {
      console.log('⚠️  Semantic search failed:', response.data);
    }
  } catch (error) {
    console.error('❌ Semantic search failed:', error.response?.data || error.message);
  }
}

async function testBridgeRecommendations() {
  try {
    console.log('\n🌉 Testing bridge recommendations...');
    
    const response = await axios.post(`${BASE_URL}/context/bridge-recommendations`, {
      sourceTag: 'research',
      targetTag: 'symbi',
      limit: 3
    }, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      const recommendations = response.data.data;
      console.log(`✅ Bridge recommendations found ${recommendations.length} connections`);
      
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.data?.title || rec.title || 'Untitled'}`);
        console.log(`   Relevance: ${rec.relevance || 'N/A'}`);
        console.log(`   Tag: ${rec.tag || 'N/A'}`);
      });
    } else {
      console.log('⚠️  Bridge recommendations failed:', response.data);
    }
  } catch (error) {
    console.error('❌ Bridge recommendations failed:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting HTML Context Bridge Tests\n');
  
  // Connect to MongoDB to verify data
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📊 Connected to MongoDB');
    
    const Context = require('./models/context.model');
    const contextCount = await Context.countDocuments();
    console.log(`📈 Total contexts in database: ${contextCount}`);
    
    const htmlContexts = await Context.find({
      'metadata.extractedFrom': 'html'
    }).select('data.title tag data.originalFile');
    
    console.log(`📄 HTML contexts found: ${htmlContexts.length}`);
    htmlContexts.forEach((ctx, index) => {
      console.log(`   ${index + 1}. ${ctx.data?.title || 'Untitled'} (${ctx.tag})`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return;
  }
  
  // Run API tests
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }
  
  await testContextSearch();
  await testSemanticSearch();
  await testBridgeRecommendations();
  
  // Close connections
  await mongoose.connection.close();
  console.log('\n🏁 HTML Context Bridge Tests Complete!');
}

// Run the tests
runTests().catch(console.error);