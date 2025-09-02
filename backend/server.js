const http = require('http');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app');
const { setSocketIO } = require('./utils/socket');
const Conversation = require('./models/conversation.model');

// Load environment variables
dotenv.config();

// Trust proxy for rate-limit behind proxies
app.set('trust proxy', 1);

// Initialize HTTP + Socket.IO
const server = http.createServer(app);

const listFromEnv = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const single = process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [];
const allowedOrigins = [
  ...new Set([
    ...listFromEnv,
    ...single,
    'http://localhost:3000',
    'http://localhost:3001'
  ])
];

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === 'development') return callback(null, true);
      return allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket auth middleware
io.use((socket, next) => {
  try {
    const authHeader = socket.handshake.headers['authorization'];
    const token = socket.handshake.auth?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : undefined);
    if (!token || !secret) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, secret);
    socket.user = { id: decoded.id };
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

// Initialize socket utility
setSocketIO(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  // Join conversation room with ownership check
  socket.on('joinConversation', async (conversationId) => {
    try {
      const convo = await Conversation.findById(conversationId).select('user');
      if (!convo) return socket.emit('error', { message: 'Conversation not found' });
      if (convo.user.toString() !== socket.user.id) {
        return socket.emit('error', { message: 'Not authorized to join this conversation' });
      }
      socket.join(conversationId);
      socket.emit('joined', { conversationId });
    } catch (e) {
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('new_message', (data) => {
    if (data?.conversationId) {
      io.to(data.conversationId).emit('message_received', data);
      io.to(data.conversationId).emit('newMessage', data);
    }
  });

  socket.on('ai_communication', (data) => {
    if (data?.targetAgentId) io.to(data.targetAgentId).emit('ai_message', data);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = { app, server, io };
