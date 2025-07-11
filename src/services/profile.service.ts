import * as repo from '../repositories/profile.repository';
import prisma from '../lib/prisma';

interface ProfileData {
    nickname: string;
    birthday: string;
    gender?: string;
    customSkill?: Record<string, unknown>;
    customInterest?: Record<string, unknown>;
    customPosition?: Record<string, unknown>;
    experienceYears?: number;
    employmentStatus?: string;
    imageUrl?: string;
    summary?: string;
}

export const updateUserProfile = async (
    userId: string,
    profileData: ProfileData,
    userSkills: string[],
    desirePositions: string[]
) => {
    return prisma.$transaction(async (tx) => {
        const profile = await repo.upsertUserProfile(tx, userId, profileData);

        await repo.deleteUserSkillsByUserId(tx, userId);
        for (const skillName of userSkills) {
            const skill = await repo.findSkillByName(tx, skillName) ?? await repo.createSkill(tx, skillName);
            await repo.createUserSkill(tx, userId, skill.id);
        }

        await repo.deleteDesirePositionsByUserId(tx, userId);
        for (const positionName of desirePositions) {
            const position = await repo.findPositionByName(tx, positionName) ?? await repo.createPosition(tx, positionName);
            await repo.createDesirePosition(tx, userId, position.id);
        }

        return profile;
    });
};

export const getUserProfile = async (userId: string) => {
    const profile = await repo.findUserProfileById(prisma, userId);
    return profile;
};