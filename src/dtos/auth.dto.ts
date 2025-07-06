import { AuthProvider } from '@prisma/client';
import { IsString, IsEmail, Length, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

// 회원가입 요청 DTO
export class CreateUserRequsetDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 20)
  password!: string;

  @IsString()
  @Length(2, 30)
  nickname!: string;
}

// 로그인 요청 DTO
export class LoginUserRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 20)
  password!: string;
}

export class AccessRefreshDto {
  @IsString()
  accessToken!: string;

  @IsString()
  refreshToken!: string;
}

// 카카오 OAUTH 요청 DTO
export class AuthCodeDto {
  @IsString()
  code!: string;
}

// 로그인 인증 토큰 응답 DTO
export class AuthTokenResponseDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
