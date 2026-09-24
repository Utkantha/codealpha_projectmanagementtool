const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Pass io to request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes (to be created)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));

// Socket.io setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.id} left project ${projectId}`);
  });

  socket.on('board_updated', (projectId) => {
    // Broadcast to others in the room
    socket.to(projectId).emit('board_updated');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));
