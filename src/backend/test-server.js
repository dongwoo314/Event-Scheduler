// 간단한 테스트 서버 - 기본 기능만 테스트
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 테스트 라우트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '테스트 서버가 정상 작동 중입니다!',
    timestamp: new Date().toISOString()
  });
});

// 간단한 테스트 API
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API 테스트 성공!',
    data: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('🚀 테스트 서버가 실행되었습니다!');
  console.log(`📡 포트: ${PORT}`);
  console.log(`🌐 브라우저에서 접속: http://localhost:${PORT}/health`);
  console.log(`📊 API 테스트: http://localhost:${PORT}/api/test`);
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('❌ 처리되지 않은 예외:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 처리되지 않은 Promise 거부:', reason);
});
