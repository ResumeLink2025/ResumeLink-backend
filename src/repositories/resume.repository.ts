import prisma from "../lib/prisma";

export const resumeRepository = {
  getProfile: (id: string) => {
    return prisma.userProfile.findUnique({ where: { id } });
  },

  createResume: async (
    profileId: string,
    experienceNote: string | undefined,
    data: any
  ) => {
    const positionRecords = await prisma.position.findMany({
      where: {
        name: {
          in: Array.isArray(data.positions) ? data.positions : [],
        },
      },
    });

    const positionIds = positionRecords.map((pos) => ({ id: pos.id }));

    return prisma.resume.create({
      data: {
        profileId,
        title: data.title ?? "AI 생성 이력서",
        summary: data.summary,
        isPublic: false,
        experienceNote: experienceNote ?? "",
        theme: "light",
        categories: {
          connectOrCreate: data.categories.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
        skills: {
          connectOrCreate: data.skills.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
        positions: {
          connect: positionIds,
        },
        projects: {
          create: data.projects,
        },
        activities: {
          create: data.activities,
        },
        certificates: {
          create: data.certificates.map((cert: any) => ({
            name: cert.name,
            date: new Date(cert.issueDate),
            grade: cert.score,
            issuer: cert.organization,
          })),
        },
      },
    });
  },

  getResumesByProfile: (profileId: string) => {
    return prisma.resume.findMany({
      where: { profileId },
      include: {
        categories: true,
        skills: true,
        positions: true,
        projects: true,
        activities: true,
        certificates: true,
      },
    });
  },

  getResumeById: (resumeId: string) => {
    return prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        categories: true,
        skills: true,
        positions: true,
        projects: true,
        activities: true,
        certificates: true,
      },
    });
  },

updateResume: async (resumeId: string, updateData: any) => {
  const {
    title,
    summary,
    experienceNote,
    isPublic,
    theme,
    categories,
    skills,
    positions,
    projects,
    activities,
    certificates,
  } = updateData;

  const updatePayload: any = {};

  // 스칼라 필드
  if (title !== undefined) updatePayload.title = title;
  if (summary !== undefined) updatePayload.summary = summary;
  if (experienceNote !== undefined) updatePayload.experienceNote = experienceNote;
  if (isPublic !== undefined) updatePayload.isPublic = isPublic;
  if (theme !== undefined) updatePayload.theme = theme;

  // N:M 관계 필드 처리
  if (categories) {
    updatePayload.categories = {
      set: categories.map((name: string) => ({
        name,
      })),
    };
  }

  if (skills) {
    updatePayload.skills = {
      set: skills.map((name: string) => ({
        name,
      })),
    };
  }

  if (positions) {
    const positionRecords = await prisma.position.findMany({
      where: {
        name: {
          in: positions,
        },
      },
    });

    updatePayload.positions = {
      set: positionRecords.map((pos) => ({ id: pos.id })),
    };
  }

  // 1. Resume 본체 + 다대다 필드 수정
  const updatedResume = await prisma.resume.update({
    where: { id: resumeId },
    data: updatePayload,
  });

  // 2. 1:N 관계 필드 (완전 교체 방식)
  if (projects) {
    await prisma.project.deleteMany({ where: { resumeId } });
    await prisma.project.createMany({
      data: projects.map((proj: any) => ({
        ...proj,
        resumeId,
      })),
    });
  }

  if (activities) {
    await prisma.developmentActivity.deleteMany({ where: { resumeId } });
    await prisma.developmentActivity.createMany({
      data: activities.map((act: any) => ({
        ...act,
        resumeId,
      })),
    });
  }

  if (certificates) {
    await prisma.certificate.deleteMany({ where: { resumeId } });
    await prisma.certificate.createMany({
      data: certificates.map((cert: any) => ({
        name: cert.name,
        date: new Date(cert.date),
        grade: cert.grade,
        issuer: cert.issuer,
        resumeId,
      })),
    });
  }

  return prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      categories: true,
      skills: true,
      positions: true,
      projects: true,
      activities: true,
      certificates: true,
    },
  });
},

  deleteResume: (resumeId: string) => {
    return prisma.resume.delete({ where: { id: resumeId } });
  },
};
