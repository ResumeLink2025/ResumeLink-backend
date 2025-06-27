import axios from 'axios';

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

// auth code -> refresh token
export async function getKakaoTokens(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: process.env.KAKAO_REDIRECT_URI!,
    code,
    client_secret: process.env.KAKAO_CLIENT_SECRET!,
  });

  const res = await axios.post('https://kauth.kakao.com/oauth/token', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data;
}

// refresh token -> access token
export async function refreshKakaoAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.KAKAO_CLIENT_ID!,
    refresh_token: refreshToken,
  });

  const res = await axios.post('https://kauth.kakao.com/oauth/token', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data;
}

export async function getKakaoUserInfo(accessToken: string) {
  const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });

  return data;
}


export async function verifyKakaoRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!, // 설정에 따라 필요할 수 있음
      refresh_token: refreshToken,
    });

    const response = await axios.post('https://kauth.kakao.com/oauth/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 새 액세스 토큰이 정상적으로 발급되면 토큰 유효
    return !!response.data.access_token;
  } catch (error: any) {
    if (error.response) {
      console.error('Kakao refresh token verification failed:', error.response.data);
    } else {
      console.error('Kakao refresh token verification error:', error.message);
    }
    return false;
  }
}
