import prisma from "../lib/prisma";
import type { Prisma, Skill, Position } from "@prisma/client";
import { ResumeRequestBody } from "../../types/resume";

export const resumeRepository = {
  createResume: async (
    profileId: string,
    experienceNote: string | undefined,
    data: ResumeRequestBody
  ) => {
    // 포지션 레코드 조회
    const positionRecords: Position[] = await prisma.position.findMany({
      where: {
        name: {
          in: Array.isArray(data.positions) ? data.positions : [],
        },
      },
    });

    // 스킬 존재하면 upsert (없으면 생성)
    const skillsRecords: Skill[] = await Promise.all(
      (data.skills ?? []).map((skillName: string) =>
        prisma.skill.upsert({
          where: { name: skillName },
          create: { name: skillName },
          update: {},
        })
      )
    );

    // activities 매핑 함수
    const mapActivity = (act: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      if (!act.startDate || act.startDate.trim() === "") {
        throw new Error("startDate는 필수입니다.");
      }
      return {
        title: act.title,
        description: act.description ?? "",
        startDate: new Date(act.startDate),
        endDate: act.endDate && act.endDate.trim() !== "" ? new Date(act.endDate) : undefined,
      };
    };

    // certificates 매핑 함수
    const mapCertificate = (cert: {
      name: string;
      date?: string;
      grade?: string;
      issuer?: string;
    }) => {
      const certData: {
        name: string;
        date?: Date;
        grade: string;
        issuer: string;
      } = {
        name: cert.name,
        grade: cert.grade ?? "",
        issuer: cert.issuer ?? "",
      };

      if (cert.date && cert.date.trim() !== "") {
        certData.date = new Date(cert.date);
      }

      return certData;
    };

    // Resume 생성
    return prisma.resume.create({
      data: {
        userId: profileId,
        title: data.title ?? "AI 생성 이력서",
        summary: data.summary,
        isPublic: data.isPublic ?? false,
        experienceNote: experienceNote ?? "",
        theme: data.theme ?? "light",
        categories: data.categories,

        skills: {
          create: skillsRecords.map((skill) => ({ skillId: skill.id })),
        },

        positions: {
          create: positionRecords.map((pos) => ({ positionId: pos.id })),
        },

        projects: {
          create: data.projects.map((proj) => ({
            project: { connect: { id: proj.id } },
            aiDescription: proj.projectDesc ?? "",
          })),
        },

        activities: {
          create: (data.activities ?? []).map(mapActivity),
        },

        certificates: {
          create: (data.certificates ?? []).map(mapCertificate),
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
  },

  getResumesByProfile: (userId: string) => {
    return prisma.resume.findMany({
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

  getResumeById: (resumeId: string) => {
    return prisma.resume.findUnique({
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
    if (categories) updatePayload.categories = categories;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.resume.update({
        where: { id: resumeId },
        data: updatePayload,
      });

      if (skills) {
        await tx.resumeSkill.deleteMany({ where: { resumeId } });
        if (skills.length > 0) {
          const skillRecords: Skill[] = await tx.skill.findMany({
            where: { name: { in: skills } },
          });
          await Promise.all(
            skillRecords.map((skill) =>
              tx.resumeSkill.create({
                data: { resumeId, skillId: skill.id },
              })
            )
          );
        }
      }

      if (positions) {
        await tx.resumePosition.deleteMany({ where: { resumeId } });
        if (positions.length > 0) {
          const positionRecords: Position[] = await tx.position.findMany({
            where: { name: { in: positions } },
          });
          await Promise.all(
            positionRecords.map((pos) =>
              tx.resumePosition.create({
                data: { resumeId, positionId: pos.id },
              })
            )
          );
        }
      }

      if (projects) {
        await tx.projectResume.deleteMany({ where: { resumeId } });
        if (projects.length > 0) {
          await Promise.all(
            projects.map((proj: any) =>
              tx.projectResume.create({
                data: {
                  resumeId,
                  projectId: proj.id,  // 여기서도 proj.id는 Project UUID
                  aiDescription: proj.aiDescription ?? "",
                },
              })
            )
          );
        }
      }

      if (activities) {
        await tx.developmentActivity.deleteMany({ where: { resumeId } });
        if (activities.length > 0) {
          await tx.developmentActivity.createMany({
            data: activities.map((act: any) => ({ ...act, resumeId })),
          });
        }
      }

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
    });
  },

  deleteResume: (resumeId: string) => {
    return prisma.resume.delete({ where: { id: resumeId } });
  },

  getAllPublicResumes: () => {
    return prisma.resume.findMany({
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

  getPublicResumesByTitleSearch: (searchTerm: string) => {
    return prisma.resume.findMany({
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