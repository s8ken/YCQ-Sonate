import { io } from 'socket.io-client';

const API = process.env.API || 'http://localhost:5000';
const JWT = (process.env.JWT || '').replace(/^Bearer\s+/, '');
const CONV = process.env.CONV_ID || 'conv:test-socket';

console.log(`Connecting to: ${API}`);
console.log(`JWT provided: ${JWT ? 'Yes' : 'No'}`);
console.log(`Conversation ID: ${CONV}`);

const socket = io(API, { 
  auth: { token: JWT },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected successfully:', socket.id);
  console.log('Joining conversation:', CONV);
  socket.emit('joinConversation', CONV);
  
  // Test message after 1 second
  setTimeout(() => {
    console.log('Sending test message...');
    socket.emit('message', {
      session_id: CONV,
      content: 'Socket test message',
      timestamp: new Date().toISOString()
    });
  }, 1000);
  
  // Disconnect after 3 seconds
  setTimeout(() => {
    console.log('Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 3000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('message', (data) => {
  console.log('📨 Received message:', data);
});

socket.on('conversationJoined', (data) => {
  console.log('🏠 Joined conversation:', data);
});

socket.on('error', (error) => {
  console.error('⚠️ Socket error:', error);
});

console.log('Starting socket connection test...');
console.log('Use: API=http://localhost:5000 JWT="Bearer your-jwt" CONV_ID="conv:your-id" node scripts/socket-check.mjs');