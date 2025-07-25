# ResumeLink-Backend

AI 기반 이력서 생성, 프로젝트 포트폴리오 관리, 실시간 커뮤니케이션 기능을 제공하는 전문 네트워킹 플랫폼의 백엔드 시스템입니다.

## 주요 기능

- **AI 기반 이력서 생성**: Google Gemini AI를 활용한 개인화된 이력서 콘텐츠 생성
- **프로젝트 포트폴리오 관리**: 기술 스택 태깅, 공개/비공개 설정이 가능한 프로젝트 관리
- **실시간 커뮤니케이션**: Socket.IO 기반 채팅 및 커피챗 요청 시스템
- **OAuth 인증**: Google, Kakao 소셜 로그인 지원

## 기술 스택

| 구성 요소 | 기술 | 용도 |
|-----------|------|------|
| **Runtime** | Node.js + TypeScript | 타입 안전한 서버 개발 |
| **웹 프레임워크** | Express.js | RESTful API 엔드포인트 |
| **실시간 통신** | Socket.IO | WebSocket 기반 채팅 |
| **데이터베이스** | PostgreSQL + Prisma | 데이터 영속성 및 ORM |
| **인증** | JWT + OAuth | 보안 사용자 인증 |
| **AI 통합** | Google Gemini API | 이력서 콘텐츠 생성 |
| **파일 저장소** | AWS S3 | 이미지 및 문서 저장 |

## 프로젝트 구조

```
src/
├── app.ts            # Express 애플리케이션 설정
├── server.ts         # Socket.IO 서버 및 시작점
├── controllers/      # HTTP 요청 처리
├── services/         # 비즈니스 로직
├── repositories/     # 데이터 액세스 계층
├── routers/          # API 라우팅
├── dtos/             # 데이터 전송 객체
├── middleware/       # 인증 및 검증 미들웨어
├── lib/              # 외부 서비스 연동 (Prisma, Gemini)
└── config/           # 설정 파일
```

## 시스템 아키텍처

시스템은 4개의 주요 비즈니스 도메인으로 구성됩니다:

- **이력서 관리**: AI 기반 이력서 생성 및 관리
- **프로젝트 포트폴리오**: 프로젝트 생성, 수정, 검색 기능
- **커뮤니케이션**: 실시간 채팅 및 커피챗 시스템
- **사용자 관리**: 인증, 프로필 관리

## 시작하기

### 필수 요구사항

- Node.js 18+
- PostgreSQL
- AWS S3 계정
- Google Gemini API 키

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 생성
```bash
touch .env
```
3. Prisma 클라이언트 생성
```bash
npm run generate
```
4. 데이터베이스 마이그레이션
```bash
npm run migrate
```
5. 시드 초기 데이터
```bash
npm run seed
```
6. 개발 서버 실행
```bash
npm run dev
```

## 사용 가능한 스크립트

- `npm run dev`: 개발 서버 실행 (nodemon)
- `npm run build`: TypeScript 컴파일
- `npm run start`: 프로덕션 서버 실행
- `npm run migrate`: Prisma 마이그레이션 실행
- `npm run generate`: Prisma 클라이언트 생성
- `npm run studio`: Prisma Studio 실행

## 개발 가이드

프로젝트는 계층화된 아키텍처 패턴을 따릅니다:

1. **Router**: HTTP 요청 라우팅
2. **Controller**: 요청/응답 처리
3. **Service**: 비즈니스 로직 구현
4. **Repository**: 데이터 액세스
5. **Prisma**: ORM 및 데이터베이스 연동

## 세부 사항
https://deepwiki.com/ResumeLink2025/ResumeLink-backend/1-overview

자세한 프로젝트 세부 사항은 딥위키 링크에서 확인하실 수 있습니다.