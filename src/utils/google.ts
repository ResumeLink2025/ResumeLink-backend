import axios from 'axios';

interface GoogleUserInfo {
  "sub": string,
  "name": string,
  "given_name": string,
  "family_name": string,
  "picture": string,
  "email": string,
  "email_verified": true,
  "locale": string
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await axios.get<GoogleUserInfo>('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data; // 여기에 사용자 정보가 담겨있음
}

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export async function verifyGoogleRefreshToken(refreshToken: string, clientId: string, clientSecret: string): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post<TokenResponse>(GOOGLE_TOKEN_ENDPOINT, params.toString(), {
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