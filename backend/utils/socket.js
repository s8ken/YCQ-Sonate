let io = null;

const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call setSocketIO first.');
  }
  return io;
};

module.exports = {
  setSocketIO,
  getSocketIO
};