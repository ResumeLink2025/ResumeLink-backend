import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CoffeeChatStatus } from '@prisma/client';

// 커피챗 기본 타입 정의
export interface CoffeeChatWithUsers {
  id: string;
  requesterId: string;
  receiverId: string;
  status: CoffeeChatStatus;
  createdAt: Date;
  respondedAt?: Date | null;
  requester?: {
    profile?: {
      nickname: string;
      imageUrl?: string;
    };
  };
  receiver?: {
    profile?: {
      nickname: string;
      imageUrl?: string;
    };
  };
}

export class CreateCoffeeChatDto {
  @IsString()
  @IsNotEmpty()
  receiverId!: string;
}

export class UpdateCoffeeChatStatusDto {
  @IsEnum(CoffeeChatStatus)
  status!: CoffeeChatStatus;
}

export class GetCoffeeChatsQueryDto {
  @IsOptional()
  @IsString()
  type?: 'requested' | 'received';
}