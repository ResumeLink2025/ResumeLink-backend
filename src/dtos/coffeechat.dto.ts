import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CoffeeChatStatus, EmploymentStatus } from '@prisma/client';

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
      imageUrl?: string | null;
      experienceYears?: number;
      employmentStatus?: EmploymentStatus | null;
    } | null;
    desirePositions?: {
      position: {
        id: string;
        name: string;
      };
    }[];
  };
  receiver?: {
    profile?: {
      nickname: string;
      imageUrl?: string | null;
      experienceYears?: number;
      employmentStatus?: EmploymentStatus | null;
    } | null;
    desirePositions?: {
      position: {
        id: string;
        name: string;
      };
    }[];
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