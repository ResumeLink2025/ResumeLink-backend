import { User, PasswordResetToken, UserAuth, AuthProvider, RefreshToken } from '@prisma/client';
import prisma from '../lib/prisma';


export class AuthRepository {
  async findByEmail(email: string): Promise<UserAuth | null> {
    return prisma.userAuth.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserAuth | null> {
    return prisma.userAuth.findUnique({ where: { id } });
  }

  async findByAuthProviderId(authProvider: AuthProvider, authProviderId: string): Promise<UserAuth | null> {
    return prisma.userAuth.findFirst({
      where: {
        authProvider,
        authProviderId,
      },
    });
  }

  // 유저 등록
  async createUser(email: string, hashedPassword: string, nickname: string): Promise<UserAuth> {
    return await prisma.userAuth.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            nickname: nickname,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  // OAUTH 기반 유저 등록
  async createOAuthUser(authProvider: AuthProvider, authProviderId: string, email: string, name?: string) {
    return prisma.userAuth.create({
      data: {
        authProvider,
        authProviderId,
        email,
        profile: {
          create: {
            nickname: name ?? '',
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }
 
  async updateRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    const existingToken = await prisma.refreshToken.findFirst({
      where: {
        userId: data.userId,
        // 필요하면 userAgent, ipAddress 등 조건 추가
      },
    });

    if (existingToken) {
      return prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          token: data.token,
          expiresAt: data.expiresAt,
          createdAt: new Date(),
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
        },
      });
    } else {
      return prisma.refreshToken.create({
        data: {
          userId: data.userId,
          token: data.token,
          expiresAt: data.expiresAt,
          createdAt: new Date(),
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
        },
      });
    }
  }


  async findRefreshToken(token: string){
    return prisma.refreshToken.findUnique({
      where: { token },
    });

  }

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

/* 나중에 필요해지면 추가
  // PasswordResetToken 조회
  async findResetToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  // 사용자 비밀번호 업데이트
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // 사용된 토큰 처리
  async markResetTokenUsed(token: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }
*/
}
