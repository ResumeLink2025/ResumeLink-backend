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
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const middleware_auth_1 = require("../middlewares/middleware.auth");
const middleware_dto_1 = require("../middlewares/middleware.dto");
const project_dto_1 = require("../dtos/project.dto");
const router = (0, express_1.Router)();
const projectController = new project_controller_1.ProjectController();
// 프로젝트 생성
router.post('/', middleware_auth_1.authMiddleware, (0, middleware_dto_1.validateDto)(project_dto_1.CreateProjectDto), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.createProject(req, res);
}));
// 프로젝트 수정
router.put('/:id', middleware_auth_1.authMiddleware, (0, middleware_dto_1.validateDto)(project_dto_1.UpdateProjectDto), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.updateProject(req, res);
}));
// 개별 프로젝트 보기
router.patch('/:id', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.getProject(req, res);
}));
// 프로젝트 삭제
router.delete('/:id', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.deleteProject(req, res);
}));
// 프로젝트 기술스택 보기
router.get('/:id/skills', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.getProjectSkills(req, res);
}));
// 프로젝트 태그 보기
router.get('/:id/tags', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.getProjectTags(req, res);
}));
// 프로젝트 목록
router.get('/', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.getProjects(req, res);
}));
// 프로젝트 좋아요
router.post('/:id/favorite', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.favoriteProject(req, res);
}));
// 프로젝트 좋아요 취소
router.delete('/:id/favorite', middleware_auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield projectController.unfavoriteProject(req, res);
}));
exports.default = router;
