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
        console.log("[createResumeWithAI] 시작 - userId:", userId);
        console.log("[createResumeWithAI] requestBody:", JSON.stringify(requestBody, null, 2));
        const userProfile = yield prisma_1.default.userProfile.findUnique({ where: { id: userId } });
        if (!userProfile)
            throw new Error("프로필이 존재하지 않습니다.");
        console.log("[createResumeWithAI] userProfile:", JSON.stringify(userProfile, null, 2));
        // userSkills, desirePositions 받아오기
        const userSkills = yield prisma_1.default.userSkill.findMany({
            where: { user: { id: userProfile.id } },
            include: { skill: true },
        });
        const desirePositions = yield prisma_1.default.desirePosition.findMany({
            where: { user: { id: userProfile.id } },
            include: { position: true },
        });
        // 배열 보장 (DB에서 없으면 requestBody에서)
        const skills = userSkills.length > 0
            ? userSkills.map((us) => us.skill.name)
            : (Array.isArray(requestBody.skills) ? requestBody.skills : []);
        const positions = desirePositions.length > 0
            ? desirePositions.map((dp) => dp.position.name)
            : (Array.isArray(requestBody.positions) ? requestBody.positions : []);
        const categories = Array.isArray(requestBody.categories) ? requestBody.categories : [];
        const projects = Array.isArray(requestBody.projects) ? requestBody.projects : [];
        const activities = Array.isArray(requestBody.activities) ? requestBody.activities : [];
        const certificates = Array.isArray(requestBody.certificates) ? requestBody.certificates : [];
        console.log("[createResumeWithAI] merged skills:", skills);
        console.log("[createResumeWithAI] merged positions:", positions);
        const geminiInput = Object.assign(Object.assign({}, requestBody), { name: userProfile.nickname, categories,
            skills,
            positions, summary: (_a = userProfile.summary) !== null && _a !== void 0 ? _a : "", projects,
            activities,
            certificates });
        console.log("[createResumeWithAI] geminiInput for AI:", JSON.stringify(geminiInput, null, 2));
        const prompt = (0, prompt_1.buildNarrativeJsonPrompt)(geminiInput);
        console.log("[createResumeWithAI] prompt sent to AI:", prompt);
        const aiResult = yield (0, gemini_1.generateGeminiText)(prompt);
        console.log("[createResumeWithAI] raw AI result:", aiResult);
        let parsed;
        try {
            // AI 결과에서 ```json ... ``` 부분 제거
            const cleaned = aiResult
                .replace(/^```json/, '') // 시작 부분 ```json 제거
                .replace(/^```/, '') // 시작 부분 ``` 제거 (만약 ```json 없으면)
                .replace(/```$/, '') // 끝부분 ``` 제거
                .trim();
            parsed = JSON.parse(cleaned);
            console.log("[createResumeWithAI] parsed AI result:", JSON.stringify(parsed, null, 2));
        }
        catch (error) {
            console.error("[createResumeWithAI] Failed to parse Gemini response:", aiResult, error);
            throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
        }
        const createdResume = yield resume_repository_1.resumeRepository.createResume(userProfile.id, (_b = requestBody.experienceNote) !== null && _b !== void 0 ? _b : "", parsed);
        console.log("[createResumeWithAI] createdResume from DB:", JSON.stringify(createdResume, null, 2));
        return Object.assign(Object.assign({}, createdResume), { skills,
            positions });
    }),
    getResumesByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[getResumesByUserId] 시작 - userId:", userId);
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile) {
            console.error("[getResumesByUserId] 프로필이 존재하지 않습니다.");
            throw new Error("프로필이 존재하지 않습니다.");
        }
        console.log("[getResumesByUserId] userProfile found:", JSON.stringify(userProfile, null, 2));
        const resumes = yield resume_repository_1.resumeRepository.getResumesByProfile(userProfile.id);
        console.log("[getResumesByUserId] resumes found:", JSON.stringify(resumes, null, 2));
        return resumes;
    }),
    getResumeById: (resumeId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[getResumeById] 시작 - resumeId:", resumeId);
        const resume = yield resume_repository_1.resumeRepository.getResumeById(resumeId);
        if (!resume) {
            console.error("[getResumeById] 해당 이력서를 찾을 수 없습니다.");
            throw new Error("해당 이력서를 찾을 수 없습니다.");
        }
        console.log("[getResumeById] resume found:", JSON.stringify(resume, null, 2));
        return resume;
    }),
    updateResume: (resumeId, userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[updateResume] 시작 - resumeId:", resumeId, "userId:", userId);
        console.log("[updateResume] updateData:", JSON.stringify(updateData, null, 2));
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile) {
            console.error("[updateResume] 프로필이 존재하지 않습니다.");
            throw new Error("프로필이 존재하지 않습니다.");
        }
        console.log("[updateResume] userProfile found:", JSON.stringify(userProfile, null, 2));
        const resume = yield resume_repository_1.resumeRepository.getResumeById(resumeId);
        if (!resume || resume.userId !== userProfile.id) {
            console.error("[updateResume] 수정 권한이 없거나 이력서를 찾을 수 없습니다.");
            throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");
        }
        console.log("[updateResume] resume found:", JSON.stringify(resume, null, 2));
        const updatedResume = yield resume_repository_1.resumeRepository.updateResume(resumeId, updateData);
        console.log("[updateResume] updatedResume:", JSON.stringify(updatedResume, null, 2));
        return updatedResume;
    }),
    deleteResume: (resumeId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[deleteResume] 시작 - resumeId:", resumeId, "userId:", userId);
        const userProfile = yield prisma_1.default.userProfile.findUnique({
            where: { id: userId },
        });
        if (!userProfile) {
            console.error("[deleteResume] 프로필이 존재하지 않습니다.");
            throw new Error("프로필이 존재하지 않습니다.");
        }
        console.log("[deleteResume] userProfile found:", JSON.stringify(userProfile, null, 2));
        const resume = yield resume_repository_1.resumeRepository.getResumeById(resumeId);
        if (!resume || resume.userId !== userProfile.id) {
            console.error("[deleteResume] 삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
            throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
        }
        console.log("[deleteResume] resume found:", JSON.stringify(resume, null, 2));
        const deleted = yield resume_repository_1.resumeRepository.deleteResume(resumeId);
        console.log("[deleteResume] 삭제 완료:", JSON.stringify(deleted, null, 2));
        return deleted;
    }),
    getAllResumes: () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[getAllResumes] 시작 - 공개 이력서 전체 조회");
        const resumes = yield resume_repository_1.resumeRepository.getAllPublicResumes();
        console.log("[getAllResumes] 조회된 이력서 개수:", resumes.length);
        return resumes;
    }),
    getPublicResumesByTitleSearch: (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[getPublicResumesByTitleSearch] 시작 - searchTerm:", searchTerm);
        if (!searchTerm) {
            console.warn("[getPublicResumesByTitleSearch] searchTerm이 없어서 빈 배열 반환");
            return [];
        }
        const resumes = yield resume_repository_1.resumeRepository.getPublicResumesByTitleSearch(searchTerm);
        console.log("[getPublicResumesByTitleSearch] 조회된 이력서 개수:", resumes.length);
        return resumes;
    }),
};
