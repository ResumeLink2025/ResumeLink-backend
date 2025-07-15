"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProjects = seedProjects;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function seedProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.project.createMany({
            data: [
                {
                    projectNumber: 1,
                    projectName: "개인 포트폴리오 웹사이트",
                    projectDesc: "React와 Node.js로 만든 개인 포트폴리오 사이트입니다.",
                    isPublic: true,
                    status: client_1.ProjectStatus.COMPLETED,
                    startDate: new Date("2023-01-10"),
                    endDate: new Date("2023-03-15"),
                    role: "프론트엔드 개발 및 백엔드 API 설계",
                    userId: "917c090d-dd1f-4126-abf8-af314e1b55fa" // 실제 유저 UUID로 변경
                },
                {
                    projectNumber: 2,
                    projectName: "이커머스 웹앱",
                    projectDesc: "상품 검색, 장바구니, 결제 기능이 있는 이커머스 서비스입니다.",
                    isPublic: false,
                    status: client_1.ProjectStatus.IN_PROGRESS,
                    startDate: new Date("2024-05-01"),
                    endDate: null,
                    role: "백엔드 API 개발 및 DB 설계",
                    userId: "917c090d-dd1f-4126-abf8-af314e1b55fa"
                }
            ],
            skipDuplicates: true,
        });
        console.log('✅ Project seed completed.');
    });
}
