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
exports.UpdateMessageRequestDto = exports.GetMessagesRequestDto = exports.SendMessageRequestDto = exports.MessageType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// 메시지 타입 enum
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["FILE"] = "FILE";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
// 메시지 전송 요청 DTO
class SendMessageRequestDto {
    constructor() {
        this.messageType = MessageType.TEXT;
    }
}
exports.SendMessageRequestDto = SendMessageRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageRequestDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageRequestDto.prototype, "fileUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageRequestDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SendMessageRequestDto.prototype, "fileSize", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(MessageType),
    __metadata("design:type", String)
], SendMessageRequestDto.prototype, "messageType", void 0);
// 메시지 목록 조회 요청 DTO
class GetMessagesRequestDto {
    constructor() {
        this.limit = 20;
        this.direction = 'before'; // cursor 기준 방향
        this.fromFirstUnread = false; // 첫 번째 미읽은 메시지부터 조회
    }
}
exports.GetMessagesRequestDto = GetMessagesRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetMessagesRequestDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessagesRequestDto.prototype, "cursor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessagesRequestDto.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], GetMessagesRequestDto.prototype, "fromFirstUnread", void 0);
// 메시지 수정 요청 DTO
class UpdateMessageRequestDto {
}
exports.UpdateMessageRequestDto = UpdateMessageRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMessageRequestDto.prototype, "text", void 0);
