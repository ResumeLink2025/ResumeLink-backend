// resume.repository.ts
import prisma from "../lib/prisma";
import type { Prisma, Skill, Position } from "@prisma/client";
import type { ResumeRequestBody } from "../../types/resume";

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
          create: (data.projects ?? []).map((proj) => ({
            project: { connect: { id: proj.id } },
            aiDescription: proj.projectDesc ?? "",
          })),
        },

        activities: {
          create: data.activities ?? [],
        },

        certificates: {
          create: data.certificates ?? [],
        },
      },
      include: {
        skills: { include: { skill: true } },
        positions: { include: { position: true } },
        projects: { include: { project: true } },
        activities: true,
        certificates: true,
      },
    });
  },

  getResumesByProfile: (userId: string) => {
    return prisma.resume.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
        skills: { include: { skill: true } },
        positions: { include: { position: true } },
        projects: {
          include: {
            project: {
              include: {
                generalSkills: { include: { skill: true } },
              },
            },
          },
        },
        activities: true,
        certificates: true,
      },
    });
  },

  getResumeById: (resumeId: string) => {
    return prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
        skills: { include: { skill: true } },
        positions: { include: { position: true } },
        projects: {
          include: {
            project: {
              include: {
                generalSkills: {
                  include: { skill: true }
                }
              }
            }
          }
        },
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
          // 스킬은 이미 존재한다고 가정하고 조회
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
                  projectId: proj.id,
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
          projects: { include: { project: true } },
          activities: true,
          certificates: true,
        },
      });
    });
  },

  deleteResume: async (resumeId: string) => {
    return await prisma.$transaction(async (tx) => {
      await tx.projectResume.deleteMany({ where: { resumeId } });
      await tx.developmentActivity.deleteMany({ where: { resumeId } });
      await tx.certificate.deleteMany({ where: { resumeId } });
      await tx.resumeSkill.deleteMany({ where: { resumeId } });
      await tx.resumePosition.deleteMany({ where: { resumeId } });
      return tx.resume.delete({ where: { id: resumeId } });
    });
  },

  getAllPublicResumes: () => {
    return prisma.resume.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
        skills: { include: { skill: true } },
        positions: { include: { position: true } },
        projects: {
          include: {
            project: {
              include: {
                generalSkills: { include: { skill: true } },
              },
            },
          },
        },
        activities: true,
        certificates: true,
      },
    });
  },

  getPublicResumesByTitleSearch: (searchTerm?: string, skillNames?: string[], positionNames?: string[]) => {
    const where: Prisma.ResumeWhereInput = { isPublic: true };

    if (searchTerm && searchTerm.trim() !== "") {
      where.title = {
        contains: searchTerm,
        mode: "insensitive",
      };
    }

    if (skillNames && skillNames.length > 0) {
      where.skills = {
        some: {
          skill: {
            name: { in: skillNames },
          },
        },
      };
    }

    if (positionNames && positionNames.length > 0) {
      where.positions = {
        some: {
          position: {
            name: { in: positionNames },
          },
        },
      };
    }

    return prisma.resume.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
        skills: { include: { skill: true } },
        positions: { include: { position: true } },
        projects: {
          include: {
            project: {
              include: {
                generalSkills: { include: { skill: true } },
              },
            },
          },
        },
        activities: true,
        certificates: true,
      },
    });
  }
};
