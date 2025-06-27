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

  updateResume: (resumeId: string, updateData: any) => {
    return prisma.resume.update({
      where: { id: resumeId },
      data: {
        title: updateData.title,
        summary: updateData.summary,
        experienceNote: updateData.experienceNote,
        isPublic: updateData.isPublic,
        theme: updateData.theme,
      },
    });
  },

  deleteResume: (resumeId: string) => {
    return prisma.resume.delete({ where: { id: resumeId } });
  },
};
