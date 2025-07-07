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
exports.resumeRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.resumeRepository = {
    createResume: (profileId, experienceNote, data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const positionRecords = yield prisma_1.default.position.findMany({
            where: {
                name: {
                    in: Array.isArray(data.positions) ? data.positions : [],
                },
            },
        });
        const skillsRecords = yield Promise.all(((_a = data.skills) !== null && _a !== void 0 ? _a : []).map((skillName) => prisma_1.default.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
        })));
        return prisma_1.default.resume.create({
            data: {
                userId: profileId,
                title: (_b = data.title) !== null && _b !== void 0 ? _b : "AI 생성 이력서",
                summary: data.summary,
                isPublic: (_c = data.isPublic) !== null && _c !== void 0 ? _c : false,
                experienceNote: experienceNote !== null && experienceNote !== void 0 ? experienceNote : "",
                theme: (_d = data.theme) !== null && _d !== void 0 ? _d : "light",
                categories: data.categories,
                skills: {
                    create: skillsRecords.map((skill) => ({ skillId: skill.id })),
                },
                positions: {
                    connect: positionRecords.map((pos) => ({ id: pos.id })),
                },
                // projects는 projectId, aiDescription 포함된 객체 배열로 받음
                projects: {
                    create: ((_e = data.projects) !== null && _e !== void 0 ? _e : []).map((proj) => {
                        var _a;
                        return ({
                            projectId: proj.projectId,
                            aiDescription: (_a = proj.aiDescription) !== null && _a !== void 0 ? _a : "",
                        });
                    }),
                },
                activities: {
                    create: (_f = data.activities) !== null && _f !== void 0 ? _f : [],
                },
                certificates: {
                    create: ((_g = data.certificates) !== null && _g !== void 0 ? _g : []).map((cert) => ({
                        name: cert.name,
                        date: cert.date ? new Date(cert.date) : undefined,
                        grade: cert.grade,
                        issuer: cert.issuer,
                    })),
                },
            },
            include: {
                skills: { include: { skill: true } },
                positions: { include: { position: true } },
                projects: true,
                activities: true,
                certificates: true,
            },
        });
    }),
    getResumesByProfile: (userId) => {
        return prisma_1.default.resume.findMany({
            where: { userId },
            include: {
                skills: { include: { skill: true } },
                positions: { include: { position: true } },
                projects: true,
                activities: true,
                certificates: true,
            },
        });
    },
    getResumeById: (resumeId) => {
        return prisma_1.default.resume.findUnique({
            where: { id: resumeId },
            include: {
                skills: { include: { skill: true } },
                positions: { include: { position: true } },
                projects: true,
                activities: true,
                certificates: true,
            },
        });
    },
    updateResume: (resumeId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
        const { title, summary, experienceNote, isPublic, theme, categories, skills, positions, projects, activities, certificates, } = updateData;
        const updatePayload = {};
        if (title !== undefined)
            updatePayload.title = title;
        if (summary !== undefined)
            updatePayload.summary = summary;
        if (experienceNote !== undefined)
            updatePayload.experienceNote = experienceNote;
        if (isPublic !== undefined)
            updatePayload.isPublic = isPublic;
        if (theme !== undefined)
            updatePayload.theme = theme;
        if (categories)
            updatePayload.categories = categories;
        return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.resume.update({
                where: { id: resumeId },
                data: updatePayload,
            });
            if (skills) {
                yield tx.resumeSkill.deleteMany({ where: { resumeId } });
                if (skills.length > 0) {
                    const skillRecords = yield tx.skill.findMany({
                        where: { name: { in: skills } },
                    });
                    yield Promise.all(skillRecords.map((skill) => tx.resumeSkill.create({
                        data: { resumeId, skillId: skill.id },
                    })));
                }
            }
            if (positions) {
                yield tx.resumePosition.deleteMany({ where: { resumeId } });
                if (positions.length > 0) {
                    const positionRecords = yield tx.position.findMany({
                        where: { name: { in: positions } },
                    });
                    yield Promise.all(positionRecords.map((pos) => tx.resumePosition.create({
                        data: { resumeId, positionId: pos.id },
                    })));
                }
            }
            if (projects) {
                yield tx.projectResume.deleteMany({ where: { resumeId } });
                if (projects.length > 0) {
                    yield Promise.all(projects.map((proj) => {
                        var _a;
                        return tx.projectResume.create({
                            data: {
                                resumeId,
                                projectId: proj.projectId,
                                aiDescription: (_a = proj.aiDescription) !== null && _a !== void 0 ? _a : "",
                            },
                        });
                    }));
                }
            }
            if (activities) {
                yield tx.developmentActivity.deleteMany({ where: { resumeId } });
                if (activities.length > 0) {
                    yield tx.developmentActivity.createMany({
                        data: activities.map((act) => (Object.assign(Object.assign({}, act), { resumeId }))),
                    });
                }
            }
            if (certificates) {
                yield tx.certificate.deleteMany({ where: { resumeId } });
                if (certificates.length > 0) {
                    yield tx.certificate.createMany({
                        data: certificates.map((cert) => ({
                            name: cert.name,
                            date: cert.date ? new Date(cert.date) : undefined,
                            grade: cert.grade,
                            issuer: cert.issuer,
                            resumeId,
                        })),
                    });
                }
            }
            return tx.resume.findUnique({
                where: { id: resumeId },
                include: {
                    skills: { include: { skill: true } },
                    positions: { include: { position: true } },
                    projects: true,
                    activities: true,
                    certificates: true,
                },
            });
        }));
    }),
    deleteResume: (resumeId) => {
        return prisma_1.default.resume.delete({ where: { id: resumeId } });
    },
    getAllPublicResumes: () => {
        return prisma_1.default.resume.findMany({
            where: { isPublic: true },
            select: {
                id: true,
                title: true,
                userId: true,
                skills: {
                    select: {
                        skill: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                positions: {
                    select: {
                        position: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    },
    getPublicResumesByTitleSearch: (searchTerm) => {
        return prisma_1.default.resume.findMany({
            where: {
                isPublic: true,
                title: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                title: true,
                userId: true,
                skills: {
                    select: {
                        skill: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                positions: {
                    select: {
                        position: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    },
};
