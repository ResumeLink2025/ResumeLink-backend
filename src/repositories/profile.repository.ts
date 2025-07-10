export const upsertUserProfile = (tx: any, userId: string, profileData: any) => {
  return tx.userProfile.upsert({
    where: { id: userId },
    update: profileData,
    create: { id: userId, ...profileData },
  });
};

export const deleteUserSkillsByUserId = (tx: any, userId: string) => {
  return tx.userSkill.deleteMany({ where: { userId } });
};

export const findSkillByName = (tx: any, name: string) => {
  return tx.skill.findUnique({ where: { name } });
};

export const createSkill = (tx: any, name: string) => {
  return tx.skill.create({ data: { name } });
};

export const createUserSkill = (tx: any, userId: string, skillId: number) => {
  return tx.userSkill.create({ data: { userId, skillId } });
};

export const deleteDesirePositionsByUserId = (tx: any, userId: string) => {
  return tx.desirePosition.deleteMany({ where: { userId } });
};

export const findPositionByName = (tx: any, name: string) => {
  return tx.position.findUnique({ where: { name } });
};

export const createPosition = (tx: any, name: string) => {
  return tx.position.create({ data: { name } });
};

export const createDesirePosition = (tx: any, userId: string, jobId: string) => {
  return tx.desirePosition.create({ data: { userId, jobId } });
};

export const findUserProfileById = (tx: any, userId: string) => {
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
    },
  });
};
