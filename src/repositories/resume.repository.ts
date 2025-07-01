import { Resume } from "@prisma/client";
import prisma from "../lib/prisma";
import { ResumeRequestBody } from "../../types/resume";

export const resumeRepository = {
  getProfile: (id: string) => {
    return prisma.userProfile.findUnique({ where: { id } });
  },

  createResume: async (
    profileId: string,
    experienceNote: string | undefined,
    data: ResumeRequestBody
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
          create: (data.certificates ?? []).map((cert: any) => ({
            name: cert.name,
            date: cert.date ? new Date(cert.date) : undefined,
            grade: cert.grade,
            issuer: cert.issuer,
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

  if (title !== undefined) updatePayload.title = title;
  if (summary !== undefined) updatePayload.summary = summary;
  if (experienceNote !== undefined) updatePayload.experienceNote = experienceNote;
  if (isPublic !== undefined) updatePayload.isPublic = isPublic;
  if (theme !== undefined) updatePayload.theme = theme;

  if (categories) {
    updatePayload.categories = {
      set: categories.map((name: string) => ({ name })),
    };
  }

  if (skills) {
    updatePayload.skills = {
      set: skills.map((name: string) => ({ name })),
    };
  }

  if (positions) {
    const positionRecords = await prisma.position.findMany({
      where: { name: { in: positions } },
    });
    updatePayload.positions = {
      set: positionRecords.map((pos) => ({ id: pos.id })),
    };
  }

  return await prisma.$transaction(async (tx) => {
    // 1. resume 본체 + 다대다 필드 업데이트
    await tx.resume.update({
      where: { id: resumeId },
      data: updatePayload,
    });

    // 2. projects 완전 교체
    if (projects) {
      await tx.project.deleteMany({ where: { resumeId } });
      if (projects.length > 0) {
        await tx.project.createMany({
          data: projects.map((proj: any) => ({ ...proj, resumeId })),
        });
      }
    }

    // 3. activities 완전 교체
    if (activities) {
      await tx.developmentActivity.deleteMany({ where: { resumeId } });
      if (activities.length > 0) {
        await tx.developmentActivity.createMany({
          data: activities.map((act: any) => ({ ...act, resumeId })),
        });
      }
    }

    // 4. certificates 완전 교체
    if (certificates) {
      await tx.certificate.deleteMany({ where: { resumeId } });
      if (certificates.length > 0) {
        await tx.certificate.createMany({
          data: certificates.map((cert: any) => ({
            name: cert.name,
            date: cert.date ? new Date(cert.date) : undefined,
            grade: cert.grade,
            issuer: cert.issuer,
            resumeId,
          })),
        });
      }
    }

    // 5. 트랜잭션 완료 후 최종 resume 데이터 조회 및 반환
    return tx.resume.findUnique({
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
  });
},


  deleteResume: (resumeId: string) => {
    return prisma.resume.delete({ where: { id: resumeId } });
  },
};
