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
exports.AuthTokenResponseDto = exports.AuthCodeDto = exports.AccessRefreshDto = exports.LoginUserRequestDto = exports.CreateUserRequsetDto = void 0;
const class_validator_1 = require("class-validator");
// 회원가입 요청 DTO
class CreateUserRequsetDto {
}
exports.CreateUserRequsetDto = CreateUserRequsetDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserRequsetDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 20),
    __metadata("design:type", String)
], CreateUserRequsetDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 30),
    __metadata("design:type", String)
], CreateUserRequsetDto.prototype, "nickname", void 0);
// 로그인 요청 DTO
class LoginUserRequestDto {
}
exports.LoginUserRequestDto = LoginUserRequestDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginUserRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 20),
    __metadata("design:type", String)
], LoginUserRequestDto.prototype, "password", void 0);
class AccessRefreshDto {
}
exports.AccessRefreshDto = AccessRefreshDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessRefreshDto.prototype, "accessToken", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccessRefreshDto.prototype, "refreshToken", void 0);
// 카카오 OAUTH 요청 DTO
class AuthCodeDto {
}
exports.AuthCodeDto = AuthCodeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthCodeDto.prototype, "code", void 0);
// 로그인 인증 토큰 응답 DTO
class AuthTokenResponseDto {
}
exports.AuthTokenResponseDto = AuthTokenResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthTokenResponseDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthTokenResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthTokenResponseDto.prototype, "refreshToken", void 0);
