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

export async function requestKakaoToken(code: string): Promise<KakaoTokenResponse> {
  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_CLIENT_ID!,
    client_id: process.env.KAKAO_CLIENT_ID as string,
    client_secret: process.env.KAKAO_CLIENT_SECRET as string,
    redirect_uri: process.env.KAKAO_REDIRECT_URI as string,
  });

  const { data } = await axios.post<KakaoTokenResponse>(KAKAO_TOKEN_URL, payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
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


export async function requestKakaoRefreshToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.KAKAO_CLIENT_ID!,
    client_secret: process.env.KAKAO_CLIENT_SECRET!,
    refresh_token: refreshToken,
  });

  const { data } = await axios.post('https://kauth.kakao.com/oauth/token', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data; // { access_token, refresh_token?, expires_in, refresh_token_expires_in, ... }
}