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
        var _a, _b, _c, _d, _e, _f;
        // 포지션 레코드 조회
        const positionRecords = yield prisma_1.default.position.findMany({
            where: {
                name: {
                    in: Array.isArray(data.positions) ? data.positions : [],
                },
            },
        });
        // 스킬 존재하면 upsert (없으면 생성)
        const skillsRecords = yield Promise.all(((_a = data.skills) !== null && _a !== void 0 ? _a : []).map((skillName) => prisma_1.default.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
        })));
        // activities 매핑 함수
        const mapActivity = (act) => {
            var _a;
            if (!act.startDate || act.startDate.trim() === "") {
                throw new Error("startDate는 필수입니다.");
            }
            return {
                title: act.title,
                description: (_a = act.description) !== null && _a !== void 0 ? _a : "",
                startDate: new Date(act.startDate),
                endDate: act.endDate && act.endDate.trim() !== "" ? new Date(act.endDate) : undefined,
            };
        };
        // certificates 매핑 함수
        const mapCertificate = (cert) => {
            var _a, _b;
            const certData = {
                name: cert.name,
                grade: (_a = cert.grade) !== null && _a !== void 0 ? _a : "",
                issuer: (_b = cert.issuer) !== null && _b !== void 0 ? _b : "",
            };
            if (cert.date && cert.date.trim() !== "") {
                certData.date = new Date(cert.date);
            }
            return certData;
        };
        // Resume 생성
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
                    create: positionRecords.map((pos) => ({ positionId: pos.id })),
                },
                projects: {
                    create: data.projects.map((proj) => {
                        var _a;
                        return ({
                            project: { connect: { id: proj.id } },
                            aiDescription: (_a = proj.projectDesc) !== null && _a !== void 0 ? _a : "",
                        });
                    }),
                },
                activities: {
                    create: ((_e = data.activities) !== null && _e !== void 0 ? _e : []).map(mapActivity),
                },
                certificates: {
                    create: ((_f = data.certificates) !== null && _f !== void 0 ? _f : []).map(mapCertificate),
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
                                projectId: proj.id, // 여기서도 proj.id는 Project UUID
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
