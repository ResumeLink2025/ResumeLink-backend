import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CoffeeChatStatus } from '@prisma/client';

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