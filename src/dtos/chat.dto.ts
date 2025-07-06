import { IsString, IsUUID, IsOptional, IsDateString, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type, Expose } from 'class-transformer';

// 채팅방 생성 요청 DTO
export class CreateChatRoomRequestDto {
  @IsUUID()
  @Expose()
  participantId!: string;
}

// 마지막 메시지 정보 DTO
export class LastMessageResponseDto {
  @IsUUID()
  @Expose()
  id!: string;

  @IsOptional()
  @IsString()
  @Expose()
  text?: string;

  @IsString()
  @Expose()
  messageType!: string;

  @IsDateString()
  @Expose()
  createdAt!: string;

  @IsUUID()
  @Expose()
  senderId!: string;
}

// 사용자 프로필 DTO
export class UserProfileDto {
  @IsString()
  @Expose()
  nickname!: string;

  @IsOptional()
  @IsString()
  @Expose()
  imageUrl?: string;
}

// 사용자 정보 DTO (참여자 정보에 포함)
export class UserInfoDto {
  @IsUUID()
  @Expose()
  id!: string;

  @IsString()
  @Expose()
  email!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserProfileDto)
  @Expose()
  profile?: UserProfileDto;
}

// 채팅방 참여자 응답 DTO
export class ChatParticipantResponseDto {
  @IsUUID()
  @Expose()
  id!: string;

  @IsUUID()
  @Expose()
  userId!: string;

  @IsDateString()
  @Expose()
  joinedAt!: string;

  @IsOptional()
  @IsDateString()
  @Expose()
  leftAt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserInfoDto)
  @Expose()
  user?: UserInfoDto;
}

// 채팅방 정보 응답 DTO
export class ChatRoomResponseDto {
  @IsUUID()
  @Expose()
  id!: string;

  @IsOptional()
  @IsUUID()
  @Expose()
  coffeeChatId?: string;

  @IsDateString()
  @Expose()
  createdAt!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatParticipantResponseDto)
  @Expose()
  participants!: ChatParticipantResponseDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LastMessageResponseDto)
  @Expose()
  lastMessage?: LastMessageResponseDto;

  @IsOptional()
  @IsNumber()
  @Expose()
  unreadCount?: number;
}

// 채팅방 목록 응답 DTO
export class ChatRoomListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatRoomResponseDto)
  @Expose()
  chatRooms!: ChatRoomResponseDto[];

  @IsNumber()
  @Expose()
  total!: number;
}
