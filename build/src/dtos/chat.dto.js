"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoomListResponseDto = exports.ChatRoomResponseDto = exports.ChatParticipantResponseDto = exports.UserInfoDto = exports.UserProfileDto = exports.LastMessageResponseDto = exports.CreateChatRoomRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// 채팅방 생성 요청 DTO
class CreateChatRoomRequestDto {
}
exports.CreateChatRoomRequestDto = CreateChatRoomRequestDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CreateChatRoomRequestDto.prototype, "participantId", void 0);
// 마지막 메시지 정보 DTO
class LastMessageResponseDto {
}
exports.LastMessageResponseDto = LastMessageResponseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LastMessageResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LastMessageResponseDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LastMessageResponseDto.prototype, "messageType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LastMessageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LastMessageResponseDto.prototype, "senderId", void 0);
// 사용자 프로필 DTO
class UserProfileDto {
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "nickname", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "imageUrl", void 0);
// 사용자 정보 DTO (참여자 정보에 포함)
class UserInfoDto {
}
exports.UserInfoDto = UserInfoDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserProfileDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", UserProfileDto)
], UserInfoDto.prototype, "profile", void 0);
// 채팅방 참여자 응답 DTO
class ChatParticipantResponseDto {
}
exports.ChatParticipantResponseDto = ChatParticipantResponseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatParticipantResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatParticipantResponseDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatParticipantResponseDto.prototype, "joinedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatParticipantResponseDto.prototype, "leftAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserInfoDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", UserInfoDto)
], ChatParticipantResponseDto.prototype, "user", void 0);
// 채팅방 정보 응답 DTO
class ChatRoomResponseDto {
}
exports.ChatRoomResponseDto = ChatRoomResponseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatRoomResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatRoomResponseDto.prototype, "coffeeChatId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatRoomResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatParticipantResponseDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], ChatRoomResponseDto.prototype, "participants", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LastMessageResponseDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", LastMessageResponseDto)
], ChatRoomResponseDto.prototype, "lastMessage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ChatRoomResponseDto.prototype, "unreadCount", void 0);
// 채팅방 목록 응답 DTO
class ChatRoomListResponseDto {
}
exports.ChatRoomListResponseDto = ChatRoomListResponseDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatRoomResponseDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], ChatRoomListResponseDto.prototype, "chatRooms", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ChatRoomListResponseDto.prototype, "total", void 0);
