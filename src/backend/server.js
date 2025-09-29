require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3001;

console.log('🔄 Starting server initialization...');

// 기본 미들웨어 설정
try {
  console.log('📝 Setting up basic middleware...');
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  console.log('✅ Helmet configured');

  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:3000",
    "http://localhost:5173",
    "https://schedule-app-project.vercel.app"
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  console.log('✅ CORS configured');

  app.use(morgan('combined'));
  console.log('✅ Morgan configured');

  app.use(express.json({ limit: '10mb' }));
  console.log('✅ JSON parser configured');

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  console.log('✅ URL encoded parser configured');

} catch (error) {
  console.error('❌ Error setting up middleware:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

console.log('✅ Health check route configured');

// API 기본 정보
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Scheduler API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      events: '/api/events',
      users: '/api/users',
      groups: '/api/groups',
      notifications: '/api/notifications'
    }
  });
});

console.log('✅ API info route configured');

// 라우트 등록
console.log('🛣️ Setting up API routes...');

try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered at /api/auth');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  const eventRoutes = require('./routes/events');
  app.use('/api/events', eventRoutes);
  console.log('✅ Event routes loaded at /api/events');
} catch (error) {
  console.error('❌ Failed to load event routes:', error.message);
}

try {
  const notificationRoutes = require('./routes/notifications');
  app.use('/api/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded at /api/notifications');
} catch (error) {
  console.error('❌ Failed to load notification routes:', error.message);
}

try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded at /api/users');
} catch (error) {
  console.error('❌ Failed to load user routes:', error.message);
}

try {
  const groupRoutes = require('./routes/groups');
  app.use('/api/groups', groupRoutes);
  console.log('✅ Group routes loaded at /api/groups');
} catch (error) {
  console.error('❌ Failed to load group routes:', error.message);
}

// Socket.IO 설정
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

console.log('✅ Socket.IO configured');

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작 - Render.com에서는 반드시 실행되어야 함
server.listen(PORT, '0.0.0.0', () => {
  console.log('🎉 ================================');
  console.log('🚀 Server running successfully!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API base: http://localhost:${PORT}/api`);
  console.log('🎉 ================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

module.exports = app;
