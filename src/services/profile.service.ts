import * as repo from '../repositories/profile.repository';
import prisma from '../lib/prisma';

interface ProfileData {
    nickname: string;
    birthday?: Date;
    gender?: string;
    customSkill?: Record<string, unknown>;
    customInterest?: Record<string, unknown>;
    customPosition?: Record<string, unknown>;
    experienceYears?: number;
    employmentStatus?: string;
    imageUrl?: string;
    summary?: string;
};

interface UserSkill {
  skill: {
    id: number;
    name: string;
  };
};

interface DesirePosition {
  position: {
    id: string;
    name: string;
  };
};
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
  const rawProfile = await repo.findUserProfileById(prisma, userId);

  if (!rawProfile) return null;

  const { 
    id,
    nickname,
    birthday,
    gender,
    customSkill,
    customInterest,
    customPosition,
    experienceYears,
    employmentStatus,
    imageUrl,
    summary,
    updatedAt,
    user
  } = rawProfile;

  const customSkillArray = customSkill ? Object.keys(customSkill).filter(key => customSkill[key]) : [];
  const customInterestArray = customInterest ? Object.keys(customInterest).filter(key => customInterest[key]) : [];
  const customPositionStr = customPosition?.preferred || null;
  const generalSkills = user?.userSkills?.map((us: UserSkill) => us.skill.name) || [];
  const desirePositions = user?.desirePositions?.map((dp: DesirePosition) => dp.position.name) || [];

  return {
      id,
      nickname,
      birthday,
      gender,
      customSkill: customSkillArray,
      customInterest: customInterestArray,
      customPosition: customPositionStr,
      experienceYears,
      employmentStatus,
      imageUrl,
      summary,
      updatedAt,
      generalSkills,
      desirePositions,
  };
};
