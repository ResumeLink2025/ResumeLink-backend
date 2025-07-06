import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';

dotenv.config();

interface GoogleUserInfo {
  "id": string;
  "name": string,
  "given_name": string,
  "family_name": string,
  "picture": string,
  "email": string,
  "email_verified": true,
  "locale": string
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

// auth code -> token
export async function getGoogleTokens(code: string) {
  const payload = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: 'authorization_code',
  };

  const response = await axios.post(
    'https://oauth2.googleapis.com/token',
    qs.stringify(payload),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data;
}

// 액세스 토큰 -> 사용자 정보 추출
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
}

// refresh access -> access token
export async function refreshGoogleAccessToken(refreshToken: string) {
  const payload = {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };

  const response = await axios.post(
    'https://oauth2.googleapis.com/token',
    qs.stringify(payload),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data;
}

export async function verifyGoogleRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post<TokenResponse>('https://oauth2.googleapis.com/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 성공적으로 새 액세스 토큰을 받았으면 토큰이 유효함
    return !!response.data.access_token;

  } catch (error: any) {
    // 에러 발생 시 리프레시 토큰이 유효하지 않거나 만료된 것으로 간주
    if (error.response) {
      console.error('Google refresh token verification failed:', error.response.data);
    } else {
      console.error('Google refresh token verification error:', error.message);
    }
    return false;
  }
}