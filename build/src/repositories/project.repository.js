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
exports.ProjectRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class ProjectRepository {
    // 1. 프로젝트 생성
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const general = data.skill.generalSkills;
            const custom = data.skill.customSkills;
            const tag = data.tags;
            const skills = yield prisma_1.default.skill.findMany({
                where: { name: { in: general } },
            });
            if (skills.length !== general.length) {
                throw new Error('존재하지 않는 Skill이 포함되어 있습니다.');
            }
            const generalSkillId = skills.map(skill => ({
                skill: { connect: { id: skill.id } },
            }));
            const project = yield prisma_1.default.project.create({
                data: {
                    userId: data.userId,
                    projectName: data.projectName,
                    projectDesc: data.projectDesc,
                    isPublic: data.isPublic,
                    status: data.status,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    role: data.role,
                    customSkills: custom,
                    tags: tag,
                    generalSkills: {
                        create: generalSkillId
                    },
                },
                include: {
                    generalSkills: true,
                },
            });
            return project;
        });
    }
    // 2. 프로젝트 단건 조회 (기본)
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.project.findUnique({
                where: { id },
            });
        });
    }
    // num to id
    findNumberToID(projectNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield prisma_1.default.project.findUnique({
                where: { projectNumber },
                select: { id: true },
            });
            return (project === null || project === void 0 ? void 0 : project.id) || null;
        });
    }
    // 3. 프로젝트 수정
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const general = data.skill.generalSkills;
            const custom = data.skill.customSkills;
            const tag = data.tags;
            const skills = yield prisma_1.default.skill.findMany({
                where: { name: { in: general } },
            });
            if (skills.length !== general.length) {
                throw new Error('존재하지 않는 Skill이 포함되어 있습니다.');
            }
            const generalSkillId = skills.map(skill => ({
                skill: { connect: { id: skill.id } },
            }));
            // 기존 generalSkills 연관관계 삭제
            yield prisma_1.default.projectSkill.deleteMany({
                where: { projectId: id },
            });
            return prisma_1.default.project.update({
                where: { id },
                data: {
                    projectName: data.projectName,
                    projectDesc: data.projectDesc,
                    isPublic: data.isPublic,
                    status: data.status,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    role: data.role,
                    customSkills: custom,
                    tags: tag,
                    generalSkills: {
                        create: generalSkillId
                    },
                },
                include: {
                    generalSkills: true,
                },
            });
        });
    }
    // 스택 정보까지 끌어오기
    findByIdDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.project.findUnique({
                where: { id },
                include: {
                    generalSkills: {
                        include: {
                            skill: true,
                        },
                    },
                },
            });
        });
    }
    // 삭제
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.project.delete({
                where: { id },
            });
        });
    }
    // 전체 목록 (필터)
    findProjects(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const where = {};
            if (query.ownerId) {
                where.userId = query.ownerId;
            }
            if (query.skill && query.skill.length > 0) {
                where.projectSkills = {
                    some: {
                        skillId: { in: query.skill },
                    },
                };
            }
            if (query.favorite) {
                where.favorites = {
                    some: {
                        userId: userId,
                    },
                };
            }
            if (query.tag && query.tag.length > 0) {
                where.tags = {
                    hasSome: query.tag,
                };
            }
            if (query.desc) {
                where.AND = where.AND || [];
                where.AND.push({
                    OR: [
                        { role: { contains: query.desc, mode: 'insensitive' } },
                        { projectDesc: { contains: query.desc, mode: 'insensitive' } }
                    ]
                });
            }
            const page = (_a = query.page) !== null && _a !== void 0 ? _a : 1;
            const limit = (_b = query.limit) !== null && _b !== void 0 ? _b : 10;
            // 비공개는 본인만
            where.OR = [
                { isPublic: true },
                { userId },
            ];
            return prisma_1.default.project.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    projectName: true,
                },
            });
        });
    }
    // 좋아요 토글
    toggleFavorite(userId, projectId, like) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield prisma_1.default.favorite.findUnique({
                where: {
                    userId_projectId: {
                        userId,
                        projectId,
                    },
                },
            });
            if (like) {
                if (favorite)
                    return false;
                yield prisma_1.default.favorite.create({
                    data: {
                        userId,
                        projectId,
                    },
                });
                return true;
            }
            else {
                if (!favorite)
                    return false;
                yield prisma_1.default.favorite.delete({
                    where: {
                        userId_projectId: {
                            userId,
                            projectId,
                        },
                    },
                });
                return true;
            }
        });
    }
}
exports.ProjectRepository = ProjectRepository;
