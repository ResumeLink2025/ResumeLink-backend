// src/config/cors.config.ts

const localOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

const prodOrigins = [
  'https://resumelink.co.kr',
];

export const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production' ? prodOrigins : localOrigins;
