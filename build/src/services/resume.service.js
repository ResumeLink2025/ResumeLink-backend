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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const prompt_1 = require("../utils/prompt");
const gemini_1 = require("../lib/gemini");
const resume_repository_1 = require("../repositories/resume.repository");
exports.resumeService = {
    createResumeWithAI: (userId, requestBody) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile)
            throw new Error("프로필이 존재하지 않습니다.");
        const userSkills = yield prisma_1.default.userSkill.findMany({
            where: { user: { id: userProfile.id } },
            include: { skill: true },
        });
        const desirePositions = yield prisma_1.default.desirePosition.findMany({
            where: { user: { id: userProfile.id } },
            include: { position: true },
        });
        const geminiInput = Object.assign(Object.assign({}, requestBody), { name: userProfile.nickname, skills: [
                ...userSkills.map((us) => us.skill.name),
                ...(Array.isArray(userProfile.customSkill)
                    ? userProfile.customSkill.filter((s) => typeof s === "string")
                    : []),
            ], position: [
                ...desirePositions.map((dp) => dp.position.name),
                ...(Array.isArray(userProfile.customPosition)
                    ? userProfile.customPosition.filter((p) => typeof p === "string")
                    : []),
            ].join(", "), summary: (_a = userProfile.summary) !== null && _a !== void 0 ? _a : "" });
        const prompt = (0, prompt_1.buildNarrativeJsonPrompt)(geminiInput);
        const aiResult = yield (0, gemini_1.generateGeminiText)(prompt);
        let parsed;
        try {
            parsed = JSON.parse(aiResult);
        }
        catch (error) {
            console.error("Failed to parse Gemini response:", aiResult, error);
            throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
        }
        return resume_repository_1.resumeRepository.createResume(userProfile.id, (_b = requestBody.experienceNote) !== null && _b !== void 0 ? _b : "", Object.assign(Object.assign({}, parsed), { positions: parsed.positions }));
    }),
    getResumesByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile)
            throw new Error("프로필이 존재하지 않습니다.");
        return resume_repository_1.resumeRepository.getResumesByProfile(userProfile.id);
    }),
    getResumeById: (resumeId) => __awaiter(void 0, void 0, void 0, function* () {
        const resume = yield resume_repository_1.resumeRepository.getResumeById(resumeId);
        if (!resume)
            throw new Error("해당 이력서를 찾을 수 없습니다.");
        return resume;
    }),
    updateResume: (resumeId, userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile)
            throw new Error("프로필이 존재하지 않습니다.");
        const resume = yield resume_repository_1.resumeRepository.getResumeById(resumeId);
        if (!resume || resume.userId !== userProfile.id) {
            throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");
        }
        return resume_repository_1.resumeRepository.updateResume(resumeId, updateData);
    }),
    deleteResume: (resumeId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile)
            throw new Error("프로필이 존재하지 않습니다.");
        const resume = yield resume_repository_1.resumeRepository.getResumeById(resumeId);
        if (!resume || resume.userId !== userProfile.id) {
            throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
        }
        return resume_repository_1.resumeRepository.deleteResume(resumeId);
    }),
    getAllResumes: () => __awaiter(void 0, void 0, void 0, function* () {
        return resume_repository_1.resumeRepository.getAllPublicResumes();
    }),
    getPublicResumesByTitleSearch: (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
        if (!searchTerm) {
            return [];
        }
        return resume_repository_1.resumeRepository.getPublicResumesByTitleSearch(searchTerm);
    }),
};
