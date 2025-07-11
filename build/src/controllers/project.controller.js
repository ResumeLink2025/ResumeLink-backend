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
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
class ProjectController {
    constructor() {
        this.projectService = new project_service_1.ProjectService();
    }
    // 프로젝트 생성
    createProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId)
                    return res.status(401).json({ message: 'Unauthorized' });
                const input = req.body;
                const createdProject = yield this.projectService.createProject(userId, input);
                return res.status(201).json({
                    message: '프로젝트 생성 성공',
                    data: createdProject,
                });
            }
            catch (error) {
                return res.status(400).json({ message: error.message || '프로젝트 생성 실패' });
            }
        });
    }
    // 프로젝트 수정
    updateProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                const input = req.body;
                const updated = yield this.projectService.updateProject(userId, projectNumber, input);
                return res.status(200).json({
                    message: '프로젝트 수정 성공',
                    data: updated,
                });
            }
            catch (error) {
                return res.status(400).json({ message: error.message || '프로젝트 수정 실패' });
            }
        });
    }
    // 단일 프로젝트 조회
    getProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                const project = yield this.projectService.getProject(userId, projectNumber);
                return res.status(200).json(project);
            }
            catch (error) {
                return res.status(error.status || 400).json({ message: error.message });
            }
        });
    }
    // 삭제
    deleteProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                yield this.projectService.deleteProject(userId, projectNumber);
                return res.status(200).json({ message: '프로젝트 삭제 성공' });
            }
            catch (error) {
                return res.status(error.status || 400).json({ message: error.message });
            }
        });
    }
    // 기술 스택
    getProjectSkills(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                const skills = yield this.projectService.getProjectSkills(userId, projectNumber);
                return res.status(200).json({ data: skills });
            }
            catch (error) {
                return res.status(error.status || 400).json({ message: error.message });
            }
        });
    }
    // 태그
    getProjectTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                const tags = yield this.projectService.getProjectTags(userId, projectNumber);
                return res.status(200).json({ data: tags });
            }
            catch (error) {
                return res.status(error.status || 400).json({ message: error.message });
            }
        });
    }
    // 전체 목록
    getProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const query = req.query;
                const projects = yield this.projectService.getProjects(userId, query);
                return res.status(200).json({ data: projects });
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        });
    }
    // 좋아요
    favoriteProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                const result = yield this.projectService.favoriteProject(userId, projectNumber);
                return res.status(200).json({ message: result });
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        });
    }
    // 좋아요 취소
    unfavoriteProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const projectNumber = parseInt(req.params.id);
                const result = yield this.projectService.unfavoriteProject(userId, projectNumber);
                return res.status(200).json({ message: result });
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.ProjectController = ProjectController;
