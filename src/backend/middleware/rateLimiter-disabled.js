// 임시로 비활성화된 rate limiter (개발용)
// express-rate-limit 패키지 설치 후 원본으로 교체 예정

// 빈 미들웨어 함수들
const emptyMiddleware = (req, res, next) => next();

module.exports = {
  generalLimiter: emptyMiddleware,
  authLimiter: emptyMiddleware,
  passwordResetLimiter: emptyMiddleware,
  notificationLimiter: emptyMiddleware,
  uploadLimiter: emptyMiddleware
};
