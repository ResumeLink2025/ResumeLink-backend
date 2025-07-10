import * as repo from '../repositories/profile.repository';
import prisma from '../lib/prisma';

interface ProfileData {
  nickname: string;
  birthday: string;
  gender?: string;
  customSkill?: any;
  customInterest?: any;
  customPosition?: any;
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
      let skill = await repo.findSkillByName(tx, skillName);
      if (!skill) {
        skill = await repo.createSkill(tx, skillName);
      }
      await repo.createUserSkill(tx, userId, skill.id);
    }

    await repo.deleteDesirePositionsByUserId(tx, userId);
    for (const positionName of desirePositions) {
      let position = await repo.findPositionByName(tx, positionName);
      if (!position) {
        position = await repo.createPosition(tx, positionName);
      }
      await repo.createDesirePosition(tx, userId, position.id);
    }

    return profile;
  });
};

export const getUserProfile = async (userId: string) => {
  const profile = await repo.findUserProfileById(prisma, userId);
  return profile;
};