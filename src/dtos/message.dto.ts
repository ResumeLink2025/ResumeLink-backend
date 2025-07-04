import { IsString, IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// 메시지 타입 enum
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

// 메시지 전송 요청 DTO
export class SendMessageRequestDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsEnum(MessageType)
  messageType: MessageType = MessageType.TEXT;
}

// 메시지 응답 DTO
export interface MessageResponseDto {
  id: string;
  chatRoomId: string;
  senderId: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  messageType: MessageType;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  sender: {
    id: string;
    email: string;
    profile?: {
      nickname: string;
      imageUrl?: string;
    };
  };
}

// 메시지 목록 조회 요청 DTO
export class GetMessagesRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string; // 마지막 메시지 ID (페이지네이션용)

  @IsOptional()
  @IsString()
  direction?: 'before' | 'after' = 'before'; // cursor 기준 방향
  
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  fromFirstUnread?: boolean = false; // 첫 번째 미읽은 메시지부터 조회
}

// 메시지 목록 응답 DTO
export interface MessageListResponseDto {
  messages: MessageResponseDto[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}

// 메시지 수정 요청 DTO
export class UpdateMessageRequestDto {
  @IsString()
  text!: string;
}


