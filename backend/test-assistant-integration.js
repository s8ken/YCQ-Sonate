const axios = require('axios');
const readline = require('readline');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = null;
let testAssistantId = null;
let testThreadId = null;

// Create readline interface for interactive testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`);
    console.error(error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testLogin = async () => {
  console.log('\n🔐 Testing user login...');
  try {
    const response = await makeRequest('POST', '/auth/login', TEST_USER);
    if (response.success && response.token) {
      authToken = response.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Login failed');
    return false;
  }
};

const testGetFunctions = async () => {
  console.log('\n📋 Testing function definitions...');
  try {
    const response = await makeRequest('GET', '/assistant/functions');
    if (response.success && response.functions) {
      console.log('✅ Function definitions retrieved successfully');
      console.log(`   Found ${response.functions.length} functions:`);
      response.functions.forEach(func => {
        console.log(`   - ${func.name}: ${func.description}`);
      });
      return true;
    } else {
      console.log('❌ Failed to get function definitions');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to get function definitions');
    return false;
  }
};

const testCreateAssistant = async () => {
  console.log('\n🤖 Testing assistant creation...');
  try {
    const assistantData = {
      name: 'Test Assistant',
      instructions: 'You are a helpful assistant that can access user data and help with various tasks. Use the available functions to retrieve information when needed.',
      model: 'gpt-4o-mini'
    };
    
    const response = await makeRequest('POST', '/assistant/create', assistantData);
    if (response.success && response.assistant) {
      testAssistantId = response.assistant.id;
      console.log('✅ Assistant created successfully');
      console.log(`   Assistant ID: ${testAssistantId}`);
      console.log(`   Name: ${response.assistant.name}`);
      console.log(`   Model: ${response.assistant.model}`);
      return true;
    } else {
      console.log('❌ Failed to create assistant');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to create assistant');
    if (error.response?.data?.error?.includes('OpenAI API key')) {
      console.log('   ⚠️  OpenAI API key not found. Please add your OpenAI API key in Settings.');
    }
    return false;
  }
};

const testListAssistants = async () => {
  console.log('\n📝 Testing assistant listing...');
  try {
    const response = await makeRequest('GET', '/assistant/list');
    if (response.success && response.assistants) {
      console.log('✅ Assistants listed successfully');
      console.log(`   Found ${response.assistants.length} assistants`);
      response.assistants.forEach(assistant => {
        console.log(`   - ${assistant.name} (${assistant.id})`);
      });
      return true;
    } else {
      console.log('❌ Failed to list assistants');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to list assistants');
    return false;
  }
};

const testCreateThread = async () => {
  console.log('\n🧵 Testing thread creation...');
  try {
    const response = await makeRequest('POST', '/assistant/thread/create');
    if (response.success && response.thread) {
      testThreadId = response.thread.id;
      console.log('✅ Thread created successfully');
      console.log(`   Thread ID: ${testThreadId}`);
      return true;
    } else {
      console.log('❌ Failed to create thread');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to create thread');
    return false;
  }
};

const testSendMessage = async () => {
  if (!testAssistantId || !testThreadId) {
    console.log('❌ Cannot test messaging - missing assistant or thread ID');
    return false;
  }
  
  console.log('\n💬 Testing message sending...');
  try {
    const messageData = {
      threadId: testThreadId,
      assistantId: testAssistantId,
      message: 'Hello! Can you tell me about my user profile and any agents I have created?'
    };
    
    console.log('   Sending message to assistant...');
    const response = await makeRequest('POST', '/assistant/message', messageData);
    
    if (response.success && response.result) {
      console.log('✅ Message sent and response received successfully');
      console.log('   Assistant response:');
      console.log(`   "${response.result.response}"`);
      
      if (response.result.functionCalls && response.result.functionCalls.length > 0) {
        console.log('   🔧 Function calls made:');
        response.result.functionCalls.forEach(call => {
          console.log(`   - ${call.name}`);
        });
      }
      
      return true;
    } else {
      console.log('❌ Failed to send message or get response');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to send message');
    return false;
  }
};

const testCleanup = async () => {
  if (testAssistantId) {
    console.log('\n🧹 Cleaning up test assistant...');
    try {
      await makeRequest('DELETE', `/assistant/${testAssistantId}`);
      console.log('✅ Test assistant deleted successfully');
    } catch (error) {
      console.log('⚠️  Failed to delete test assistant (this is okay)');
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting OpenAI Assistant Integration Tests');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Get Functions', fn: testGetFunctions },
    { name: 'Create Assistant', fn: testCreateAssistant },
    { name: 'List Assistants', fn: testListAssistants },
    { name: 'Create Thread', fn: testCreateThread },
    { name: 'Send Message', fn: testSendMessage }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) passed++;
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! OpenAI Assistant integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
  
  await testCleanup();
  rl.close();
};

// Interactive mode
const interactiveMode = async () => {
  console.log('\n🎮 Interactive Mode');
  console.log('You can now send messages to your assistant.');
  console.log('Type "exit" to quit.\n');
  
  if (!testAssistantId || !testThreadId) {
    console.log('❌ Assistant or thread not available for interactive mode');
    rl.close();
    return;
  }
  
  const askQuestion = () => {
    rl.question('You: ', async (message) => {
      if (message.toLowerCase() === 'exit') {
        await testCleanup();
        rl.close();
        return;
      }
      
      try {
        console.log('Assistant is thinking...');
        const response = await makeRequest('POST', '/assistant/message', {
          threadId: testThreadId,
          assistantId: testAssistantId,
          message
        });
        
        if (response.success) {
          console.log(`Assistant: ${response.result.response}\n`);
        } else {
          console.log('❌ Failed to get response from assistant\n');
        }
      } catch (error) {
        console.log('❌ Error sending message\n');
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--interactive') || args.includes('-i')) {
  // Run tests first, then interactive mode
  runTests().then(() => {
    if (testAssistantId && testThreadId) {
      interactiveMode();
    } else {
      console.log('\n❌ Cannot start interactive mode - tests failed');
      process.exit(1);
    }
  });
} else {
  // Just run tests
  runTests();
}