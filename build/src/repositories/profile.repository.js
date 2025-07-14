"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserProfileById = exports.createDesirePosition = exports.createPosition = exports.findPositionByName = exports.deleteDesirePositionsByUserId = exports.createUserSkill = exports.createSkill = exports.findSkillByName = exports.deleteUserSkillsByUserId = exports.upsertUserProfile = void 0;
const upsertUserProfile = (tx, userId, profileData) => {
    return tx.userProfile.upsert({
        where: { id: userId },
        update: profileData,
        create: Object.assign({ id: userId }, profileData),
    });
};
exports.upsertUserProfile = upsertUserProfile;
const deleteUserSkillsByUserId = (tx, userId) => {
    return tx.userSkill.deleteMany({ where: { userId } });
};
exports.deleteUserSkillsByUserId = deleteUserSkillsByUserId;
const findSkillByName = (tx, name) => {
    return tx.skill.findUnique({ where: { name } });
};
exports.findSkillByName = findSkillByName;
const createSkill = (tx, name) => {
    return tx.skill.create({ data: { name } });
};
exports.createSkill = createSkill;
const createUserSkill = (tx, userId, skillId) => {
    return tx.userSkill.create({ data: { userId, skillId } });
};
exports.createUserSkill = createUserSkill;
const deleteDesirePositionsByUserId = (tx, userId) => {
    return tx.desirePosition.deleteMany({ where: { userId } });
};
exports.deleteDesirePositionsByUserId = deleteDesirePositionsByUserId;
const findPositionByName = (tx, name) => {
    return tx.position.findUnique({ where: { name } });
};
exports.findPositionByName = findPositionByName;
const createPosition = (tx, name) => {
    return tx.position.create({ data: { name } });
};
exports.createPosition = createPosition;
const createDesirePosition = (tx, userId, jobId) => {
    return tx.desirePosition.create({ data: { userId, jobId } });
};
exports.createDesirePosition = createDesirePosition;
const findUserProfileById = (tx, userId) => {
    return tx.userProfile.findUnique({
        where: { id: userId },
        select: {
            id: true,
            nickname: true,
            birthday: true,
            gender: true,
            customSkill: true,
            customInterest: true,
            customPosition: true,
            experienceYears: true,
            employmentStatus: true,
            imageUrl: true,
            summary: true,
            updatedAt: true,
            userSkills: {
                select: {
                    skill: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },
            desirePositions: {
                select: {
                    position: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        },
    });
};
exports.findUserProfileById = findUserProfileById;
