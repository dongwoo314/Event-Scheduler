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
    origin: [process.env.CORS_ORIGIN || "http://localhost:3000", "http://localhost:3000"],
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

// API 기본 정보 라우트 추가
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

// 라우트 디버깅을 위한 테스트 엔드포인트
app.all('/api/auth/*', (req, res, next) => {
  console.log(`[DEBUG] Auth route hit: ${req.method} ${req.url}`);
  console.log('[DEBUG] Body:', req.body);
  next();
});

// 인증 라우트를 여기서 직접 등록 (테스트)
console.log('🔑 Attempting to load auth routes early...');
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered EARLY at /api/auth');
} catch (error) {
  console.error('❌ Failed to load auth routes EARLY:', error.message);
}

// 데이터베이스 연결 및 연동 테스트
async function testDatabaseConnection() {
  try {
    console.log('🗄️ Testing database connection...');
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // 개발 환경에서만 간단한 sync (문제 발생시 스킵)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Attempting to sync database tables...');
        await sequelize.sync({ force: false, alter: false });
        console.log('✅ Database tables synced successfully.');
      } catch (syncError) {
        console.warn('⚠️ Database sync failed, but continuing:', syncError.message);
        console.log('💡 You may need to run: npm run init-db');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    console.log('💡 Trying to continue without database...');
    return false; // 데이터베이스 없이도 계속 진행
  }
}

// API 라우트 등록 (안전하게)
async function setupRoutes() {
  console.log('🛣️ Setting up API routes...');
  
  // 인증 라우트를 가장 먼저 등록
  console.log('🔑 Loading auth routes...');
  try {
    const authRoutes = require('./routes/auth');
    
    // 라우트를 등록하기 전에 라우트 객체 확인
    if (typeof authRoutes === 'function' || typeof authRoutes === 'object') {
      app.use('/api/auth', authRoutes);
      console.log('✅ Auth routes registered at /api/auth');
      console.log('✅ POST /api/auth/register');
      console.log('✅ POST /api/auth/login');
    } else {
      throw new Error('Auth routes is not a valid router');
    }
  } catch (error) {
    console.error('❌ Failed to load auth routes:', error.message);
    console.error('❌ Stack:', error.stack);
    
    // 라우트 로드 실패 시 에러 더 상세하게 출력
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Module not found. Check if ./routes/auth.js exists');
    }
    
    // 라우트 로드 실패해도 계속 진행
  }

  // 이벤트 라우트
  try {
    const eventRoutes = require('./routes/events');
    app.use('/api/events', eventRoutes);
    console.log('✅ Event routes loaded: /api/events');
  } catch (error) {
    console.error('❌ Failed to load event routes:', error.message);
  }

  // 알림 라우트  
  try {
    const notificationRoutes = require('./routes/notifications');
    app.use('/api/notifications', notificationRoutes);
    console.log('✅ Notification routes loaded: /api/notifications');
  } catch (error) {
    console.error('❌ Failed to load notification routes:', error.message);
  }

  // 사용자 라우트
  try {
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded: /api/users');
  } catch (error) {
    console.error('❌ Failed to load user routes:', error.message);
  }

  // 그룹 라우트
  try {
    const groupRoutes = require('./routes/groups');
    app.use('/api/groups', groupRoutes);
    console.log('✅ Group routes loaded: /api/groups');
  } catch (error) {
    console.error('❌ Failed to load group routes:', error.message);
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

    // 1. 데이터베이스 연결 시도 (실패해도 계속 진행)
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.log('⚠️ Starting server without database connection...');
    }

    // 2. API 라우트 설정 (항상 실행)
    console.log('🔧 Setting up routes...');
    await setupRoutes();
    console.log('✅ Routes setup completed');

    // 알림 스케줄러 시작 (데이터베이스 연결 성공 시)
    if (dbConnected) {
      try {
        const notificationScheduler = require('./services/notificationScheduler');
        notificationScheduler.start();
        console.log('✅ Notification scheduler started');
      } catch (error) {
        console.error('❌ Failed to start notification scheduler:', error.message);
      }
    }

    // 서버 시작
    server.listen(PORT, () => {
      console.log('🎉 ================================');
      console.log('🚀 Server running successfully!');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API base: http://localhost:${PORT}/api`);
      if (!dbConnected) {
        console.log('⚠️ Database not connected - some features may not work');
      }
      console.log('🎉 ================================');
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    console.log('💡 Try deleting database.sqlite and running: npm run init-db');
    // 개발 환경에서는 계속 시도
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Attempting to start without database...');
      server.listen(PORT, () => {
        console.log(`🚀 Server started on port ${PORT} (database disabled)`);
      });
    } else {
      process.exit(1);
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  try {
    const notificationScheduler = require('./services/notificationScheduler');
    notificationScheduler.stop();
  } catch (error) {
    console.error('Error stopping scheduler:', error);
  }
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  try {
    const notificationScheduler = require('./services/notificationScheduler');
    notificationScheduler.stop();
  } catch (error) {
    console.error('Error stopping scheduler:', error);
  }
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// 서버 시작
startServer();

module.exports = app;
