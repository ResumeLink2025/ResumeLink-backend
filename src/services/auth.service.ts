import { hashPassword, verifyPassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, signToken, verifyRefreshToken } from '../utils/jwt'
import { getGoogleTokens, getGoogleUserInfo, refreshGoogleAccessToken, verifyGoogleRefreshToken} from '../utils/google'
import { AuthRepository } from '../repositories/auth.repository';
import { CreateUserRequsetDto, AuthTokenResponseDto, LoginUserRequestDto, AccessRefreshDto, AuthCodeDto } from '../dtos/auth.dto';
import { plainToInstance } from 'class-transformer';
import { getKakaoTokens, getKakaoUserInfo, refreshKakaoAccessToken, requestKakaoToken, verifyKakaoRefreshToken } from '../utils/kakao';
import { access } from 'fs';

export class AuthService {
  
  constructor(private readonly authRepository = new AuthRepository()) {}

  async registerUser(input: CreateUserRequsetDto): Promise<AuthTokenResponseDto> {
    const {email, password, nickname} = input

    const existingEmail = await this.authRepository.findByEmail(email)
    if (existingEmail) throw new Error('이미 존재하는 이메일입니다.')
    
    const hashed = await hashPassword(password);
    const user = await this.authRepository.createUser(email, hashed, nickname)
    
    const accessToken = generateAccessToken({userId: user.id})
    const refreshToken = generateRefreshToken({userId: user.id})

    const response = {userId: user.id, accessToken, refreshToken}
    const responseDto = plainToInstance(AuthTokenResponseDto, response)
    return responseDto
  }

  async loginUser(input: LoginUserRequestDto): Promise<AuthTokenResponseDto> {
    const {email, password} = input

    const existingEmail = await this.authRepository.findByEmail(email)
    if (!existingEmail) throw new Error('이메일 또는 비밀번호가 잘못되었습니다.')
    const user = existingEmail

    // 로컬 프로바이더가 아닐 경우 예외 처리
    if (user.authProvider !== 'local') {
      throw new Error(`해당 이메일은 ${user.authProvider} 로그인으로 등록된 계정입니다.`);
    }

    const verify = await verifyPassword(password, existingEmail.password!);
    
    if (!verify) throw new Error('이메일 또는 비밀번호가 잘못되었습니다.')

    const accessToken = generateAccessToken({userId: user.id})
    const refreshToken = generateRefreshToken({userId: user.id})

    const response = {userId: user.id, accessToken, refreshToken}
    const responseDto = plainToInstance(AuthTokenResponseDto, response)
    return responseDto
  }

  // 구글 Oauth 로그인 및 신규 가입
  async loginGoogle(input: AuthCodeDto){
    const { code } = input

    const tokens = await getGoogleTokens(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    const data = await getGoogleUserInfo(accessToken)
    if (!data.id) throw new Error("액세스 토큰이 잘못되었습니다.");
    let user = await this.authRepository.findByAuthProviderId('google', data.id);

    if (!user){
       user = await this.authRepository.createOAuthUser('google', data.id, data.email, data.name);
    }

    

    const refreshInput = {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now()+ 1000 * 60 * 60 * 24 * 7)
    }

    await this.authRepository.updateRefreshToken(refreshInput)
    const token = generateAccessToken({userId: user.id})
    

    return {userId: user.id, accessToken: token, refreshToken}
  }

    // 카카오 Oauth 로그인 및 신규 가입
    async loginKakao(input: AuthCodeDto) {
      const { code } = input;
      const tokens = await getKakaoTokens(code)
      const accessToken = await tokens.access_token;
      const refreshToken = tokens.refresh_token;
    
      const data = await getKakaoUserInfo(accessToken);


      if (!data.id) throw new Error("액세스 토큰이 잘못되었습니다.");

      // authProviderId는 'kakao', 식별자는 data.id
      let user = await this.authRepository.findByAuthProviderId('kakao', String(data.id));

      console.log(user)

      if (!user) {
        const email = data.kakao_account?.email || `${data.id}@kakao.com`;
        const name = data.properties?.nickname || 'username';

        user = await this.authRepository.createOAuthUser('kakao', String(data.id), email, name);
      }

      const refreshInput = {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      };

      await this.authRepository.updateRefreshToken(refreshInput);

      const token = generateAccessToken({ userId: user.id });

      return {
        userId: user.id,
        accessToken: token,
        refreshToken,
      };
    }

    async refreshAccessToken(refreshToken: string): Promise<string> {
      const tokenRecord = await this.authRepository.findRefreshToken(refreshToken);
      if (!tokenRecord) throw new Error('Refresh token not found');

      if (tokenRecord.expiresAt < new Date()) throw new Error('Refresh token expired');

      const user = await this.authRepository.findById(tokenRecord.userId);
      if (!user) throw new Error('User not found');

      if (user.authProvider === 'google') {
        const valid = await verifyGoogleRefreshToken(refreshToken);
        if (!valid) throw new Error('Invalid Google refresh token');
      } else if (user.authProvider === 'kakao') {
        const valid = await verifyKakaoRefreshToken(refreshToken);
        if (!valid) throw new Error('Invalid Kakao refresh token');
      }
      // 'local' provider의 경우, DB에 토큰이 있고 만료되지 않았다면 유효한 것으로 간주합니다.

      return generateAccessToken({ userId: user.id });
    }
  
  /*
  // 이메일 입력 후 토큰 생성
  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new Error('해당 이메일의 사용자가 없습니다.');

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30분 유효

    await this.authRepository.createPasswordResetToken(user.id, token, expiresAt);
    return token;
  }
    */


  /* 나중에 필요해지면 추가
  // 토큰 유효성 검사 후 비밀번호 재설정
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.authRepository.findResetToken(token);
    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.used) {
      return { success: false, message: '유효하지 않거나 만료된 토큰입니다.', status: 400 };
    }

    const hashed = await hashPassword(newPassword);
    await this.authRepository.updatePassword(resetToken.userId, hashed);
    await this.authRepository.markResetTokenUsed(token);

    return { success: true };
  }
    */
}