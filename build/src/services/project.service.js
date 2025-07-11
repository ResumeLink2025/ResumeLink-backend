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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("../repositories/project.repository");
class ProjectService {
    constructor(projectRepository = new project_repository_1.ProjectRepository()) {
        this.projectRepository = projectRepository;
    }
    // 1. 프로젝트 생성
    createProject(userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { projectName, projectDesc, isPublic, status, startDate, endDate, role, skill, tags, } = input;
            const project = yield this.projectRepository.create({
                userId,
                projectName,
                projectDesc: projectDesc || "",
                isPublic,
                status,
                startDate,
                endDate: endDate || startDate,
                skill: { generalSkills: skill.generalSkills, customSkills: skill.customSkills },
                role,
                tags
            });
            return project;
        });
    }
    // 2. 프로젝트 수정
    updateProject(userId, projectNumber, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const project = yield this.projectRepository.findById(projectId);
            if (!project)
                throw new Error('존재하지 않는 프로젝트입니다.');
            if (project.userId !== userId)
                throw new Error('수정 권한이 없습니다.');
            const { projectName, projectDesc, isPublic, status, startDate, endDate, role, skill, tags, } = input;
            const updated = yield this.projectRepository.update(projectId, {
                userId,
                projectName,
                projectDesc: projectDesc || "",
                isPublic,
                status,
                startDate,
                endDate: endDate || startDate,
                role: role,
                skill: { generalSkills: skill.generalSkills, customSkills: skill.customSkills },
                tags: tags,
            });
            return updated;
        });
    }
    // 3. 개별 프로젝트 보기
    getProject(userId, projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const project = yield this.projectRepository.findByIdDetail(projectId);
            if (!project)
                throw new Error('존재하지 않는 프로젝트입니다.');
            if (!project.isPublic && project.userId !== userId) {
                const error = new Error('볼 권한이 없습니다.');
                error.status = 403;
                throw error;
            }
            const { generalSkills, customSkills } = project, rest = __rest(project, ["generalSkills", "customSkills"]);
            const generalSkillsNames = project.generalSkills.map((gs) => gs.skill.name);
            const result = Object.assign(Object.assign({}, rest), { skill: {
                    generalSkills: generalSkillsNames,
                    customSkills
                } });
            return result;
        });
    }
    // 4. 삭제
    deleteProject(userId, projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const project = yield this.projectRepository.findById(projectId);
            if (!project)
                throw new Error('존재하지 않는 프로젝트입니다.');
            if (project.userId !== userId) {
                const error = new Error('삭제 권한이 없습니다.');
                error.status = 403;
                throw error;
            }
            yield this.projectRepository.delete(projectId);
            return true;
        });
    }
    // 5. 기술스택 보기
    getProjectSkills(userId, projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const project = yield this.projectRepository.findByIdDetail(projectId);
            if (!project)
                throw new Error('존재하지 않는 프로젝트입니다.');
            if (!project.isPublic && project.userId !== userId) {
                const error = new Error('볼 권한이 없습니다.');
                error.status = 403;
                throw error;
            }
            return {
                general_skills: project.generalSkills,
                custom_skills: project.customSkills,
            };
        });
    }
    // 6. 태그 보기
    getProjectTags(userId, projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const project = yield this.projectRepository.findByIdDetail(projectId);
            if (!project)
                throw new Error('존재하지 않는 프로젝트입니다.');
            if (!project.isPublic && project.userId !== userId) {
                const error = new Error('볼 권한이 없습니다.');
                error.status = 403;
                throw error;
            }
            return project.tags;
        });
    }
    // 7. 프로젝트 목록
    getProjects(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.projectRepository.findProjects(userId, query);
        });
    }
    // 9. 좋아요
    favoriteProject(userId, projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const favorite = yield this.projectRepository.toggleFavorite(userId, projectId, true);
            return favorite ? '프로젝트에 좋아요했습니다.' : '이미 좋아요한 프로젝트입니다.';
        });
    }
    // 10. 좋아요 취소
    unfavoriteProject(userId, projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectNumber)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const projectId = yield this.projectRepository.findNumberToID(projectNumber);
            if (!projectId)
                throw new Error('프로젝트를 찾을 수 없습니다.');
            const favorite = yield this.projectRepository.toggleFavorite(userId, projectId, false);
            return favorite ? '프로젝트에 좋아요를 취소했습니다.' : '이미 좋아요가 취소된 프로젝트입니다.';
        });
    }
}
exports.ProjectService = ProjectService;
