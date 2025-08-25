# 스케줄 관리 서비스 API 문서

## 개요
스케줄 관리 서비스의 RESTful API 문서입니다. 이 API는 사용자 인증, 이벤트 관리, 그룹 관리, 알림 시스템을 지원합니다.

## 기본 정보
- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## 인증 (Authentication)

### 회원가입
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "홍",
  "last_name": "길동",
  "username": "honggildong",
  "phone_number": "010-1234-5678",
  "timezone": "Asia/Seoul",
  "language": "ko"
}
```

**Response:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "홍",
      "last_name": "길동",
      "username": "honggildong"
    },
    "tokens": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": "7d"
    }
  }
}
```

### 로그인
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 토큰 갱신
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

### 현재 사용자 정보
```http
GET /auth/me
Authorization: Bearer {access_token}
```

## 사용자 관리 (Users)

### 프로필 조회
```http
GET /users/profile
Authorization: Bearer {access_token}
```

### 프로필 수정
```http
PUT /users/profile
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "first_name": "김",
  "last_name": "철수",
  "phone_number": "010-9876-5432"
}
```

### 비밀번호 변경
```http
PUT /users/password
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

### 대시보드 데이터
```http
GET /users/dashboard
Authorization: Bearer {access_token}
```

### 사용자 검색
```http
GET /users/search?q=검색어&page=1&limit=20
Authorization: Bearer {access_token}
```

## 이벤트 관리 (Events)

### 이벤트 목록 조회
```http
GET /events?page=1&limit=20&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `start_date`: 시작 날짜 (ISO 8601 형식)
- `end_date`: 종료 날짜 (ISO 8601 형식)
- `status`: 이벤트 상태 (draft, published, cancelled, completed)
- `category`: 카테고리
- `event_type`: 이벤트 타입 (personal, group, public)

### 이벤트 생성
```http
POST /events
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "title": "중요한 회의",
  "description": "월간 팀 회의입니다.",
  "start_time": "2024-12-20T10:00:00Z",
  "end_time": "2024-12-20T11:00:00Z",
  "location": "회의실 A",
  "location_type": "physical",
  "timezone": "Asia/Seoul",
  "visibility": "private",
  "event_type": "personal",
  "category": "업무",
  "priority": "high",
  "notification_settings": {
    "enable_notifications": true,
    "advance_notifications": [15, 60],
    "notification_types": ["push", "email"]
  }
}
```

### 이벤트 상세 조회
```http
GET /events/{id}
Authorization: Bearer {access_token}
```

### 이벤트 수정
```http
PUT /events/{id}
Authorization: Bearer {access_token}
```

### 이벤트 삭제
```http
DELETE /events/{id}
Authorization: Bearer {access_token}
```

## 그룹 관리 (Groups)

### 그룹 목록 조회
```http
GET /groups?page=1&limit=20
Authorization: Bearer {access_token}
```

### 그룹 생성
```http
POST /groups
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "개발팀",
  "description": "소프트웨어 개발팀 그룹입니다.",
  "group_type": "private",
  "category": "업무",
  "max_members": 50,
  "settings": {
    "allow_member_invites": false,
    "require_approval": true,
    "auto_notifications": true
  }
}
```

### 그룹 상세 조회
```http
GET /groups/{id}
Authorization: Bearer {access_token}
```

### 그룹 수정
```http
PUT /groups/{id}
Authorization: Bearer {access_token}
```

### 그룹 삭제
```http
DELETE /groups/{id}
Authorization: Bearer {access_token}
```

## 알림 관리 (Notifications)

### 알림 목록 조회
```http
GET /notifications?page=1&limit=20&unread_only=true
Authorization: Bearer {access_token}
```

### 읽지 않은 알림 수
```http
GET /notifications/unread-count
Authorization: Bearer {access_token}
```

### 알림 읽음 처리
```http
PUT /notifications/{id}/read
Authorization: Bearer {access_token}
```

### 모든 알림 읽음 처리
```http
PUT /notifications/read-all
Authorization: Bearer {access_token}
```

### 알림 삭제
```http
DELETE /notifications/{id}
Authorization: Bearer {access_token}
```

## 에러 응답 형식

모든 API 에러는 다음 형식으로 응답됩니다:

```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [
    {
      "field": "field_name",
      "message": "필드별 에러 메시지",
      "value": "입력된 값"
    }
  ]
}
```

## HTTP 상태 코드

- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `409 Conflict`: 리소스 충돌 (예: 중복 이메일)
- `422 Unprocessable Entity`: 유효성 검사 실패
- `500 Internal Server Error`: 서버 내부 오류

## 페이지네이션

목록 조회 API는 다음과 같은 페이지네이션 형식을 사용합니다:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 실시간 통신 (WebSocket)

서버는 Socket.IO를 사용하여 실시간 기능을 제공합니다.

### 연결
```javascript
const socket = io('http://localhost:3001');

// 사용자 룸에 참가
socket.emit('join', userId);
```

### 이벤트 리스너
```javascript
// 새 이벤트 생성 알림
socket.on('event_created', (data) => {
  console.log('새 이벤트:', data.event);
});

// 이벤트 업데이트 알림
socket.on('event_updated', (data) => {
  console.log('이벤트 업데이트:', data.event);
});

// 실시간 알림
socket.on('notification', (data) => {
  console.log('새 알림:', data.notification);
});
```

## 개발 환경 설정

1. 환경 변수 설정 (.env)
2. 데이터베이스 연결 설정
3. JWT 시크릿 키 설정
4. 외부 서비스 API 키 설정 (Firebase, SMTP 등)

자세한 설정 방법은 README.md 파일을 참조하세요.
