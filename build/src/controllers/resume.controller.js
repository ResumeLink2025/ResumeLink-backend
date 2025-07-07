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
exports.resumeController = void 0;
const resume_service_1 = require("../services/resume.service");
exports.resumeController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.user;
            const resume = yield resume_service_1.resumeService.createResumeWithAI(userId, req.body);
            res.status(201).json(resume);
        }
        catch (error) {
            console.error("이력서 생성 실패:", error);
            res.status(500).json({ message: "이력서 생성 중 오류 발생" });
        }
    }),
    getAllByUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.user;
            const resumes = yield resume_service_1.resumeService.getResumesByUserId(userId);
            res.json(resumes);
        }
        catch (error) {
            console.error("이력서 목록 조회 실패:", error);
            res.status(500).json({ message: "이력서 목록 조회 중 오류 발생" });
        }
    }),
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const resume = yield resume_service_1.resumeService.getResumeById(id);
            res.json(resume);
        }
        catch (error) {
            console.error("이력서 조회 실패:", error);
            res.status(404).json({ message: "이력서를 찾을 수 없습니다." });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { userId } = req.user;
            const updated = yield resume_service_1.resumeService.updateResume(id, userId, req.body);
            res.json(updated);
        }
        catch (error) {
            console.error("이력서 수정 실패:", error);
            const message = error.message === "프로필이 존재하지 않습니다." ||
                error.message.includes("권한")
                ? error.message
                : "이력서 수정 중 오류 발생";
            res.status(403).json({ message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { userId } = req.user;
            yield resume_service_1.resumeService.deleteResume(id, userId);
            res.status(204).send();
        }
        catch (error) {
            console.error("이력서 삭제 실패:", error);
            const message = error.message === "프로필이 존재하지 않습니다." ||
                error.message.includes("권한")
                ? error.message
                : "이력서 삭제 중 오류 발생";
            res.status(403).json({ message });
        }
    }),
    getAllPublic: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const resumes = yield resume_service_1.resumeService.getAllResumes();
            res.json(resumes);
        }
        catch (error) {
            console.error("이력서 목록 조회 실패:", error);
            res.status(500).json({ message: "이력서 목록 조회 중 오류 발생" });
        }
    }),
    getPublicResumesByTitleSearch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { searchTerm } = req.query;
            const resumes = yield resume_service_1.resumeService.getPublicResumesByTitleSearch(typeof searchTerm === "string" ? searchTerm : undefined);
            res.json(resumes);
        }
        catch (error) {
            console.error("제목 검색 이력서 조회 실패:", error);
            res.status(500).json({ message: "이력서 검색 중 오류 발생" });
        }
    }),
};
