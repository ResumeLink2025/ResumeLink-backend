import { User, PasswordResetToken } from '@prisma/client';
import prisma from '../lib/prisma';


export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(email: string, hashedPassword: string, name: string): Promise<User> {
    return prisma.user.create({
      data: { email, password: hashedPassword, nickname: name },
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

}
