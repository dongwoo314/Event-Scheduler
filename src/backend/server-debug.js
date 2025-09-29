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

// 기본 미들웨어 설정 (단계별로)
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

  app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
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

// 데이터베이스 연결 테스트
async function testDatabaseConnection() {
  try {
    console.log('🗄️ Testing database connection...');
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    return false;
  }
}

// API 라우트 등록 (안전하게)
async function setupRoutes() {
  try {
    console.log('🛣️ Setting up API routes...');
    
    // 인증 라우트
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');

    // 이벤트 라우트
    const eventRoutes = require('./routes/events');
    app.use('/api/events', eventRoutes);
    console.log('✅ Event routes loaded');

    // 알림 라우트  
    const notificationRoutes = require('./routes/notifications');
    app.use('/api/notifications', notificationRoutes);
    console.log('✅ Notification routes loaded');

    // 사용자 라우트
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');

    // 그룹 라우트
    const groupRoutes = require('./routes/groups');
    app.use('/api/groups', groupRoutes);
    console.log('✅ Group routes loaded');

  } catch (error) {
    console.error('❌ Error setting up routes:', error);
    throw error;
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

console.log('✅ Socket.IO configured');

// Make io accessible to routes
app.locals.io = io;

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
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

// 서버 시작 함수
async function startServer() {
  try {
    console.log('🚀 Starting server...');

    // 데이터베이스 연결 확인
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // API 라우트 설정
    await setupRoutes();

    // 서버 시작
    server.listen(PORT, () => {
      console.log('🎉 ================================');
      console.log('🚀 Server running successfully!');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API base: http://localhost:${PORT}/api`);
      console.log('🎉 ================================');
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// 서버 시작
startServer();

module.exports = app;
