import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import { ResumeRequestBody } from "../../types/resume";
import prisma from "../lib/prisma";

export const resumeService = {
  createResumeWithAI: async (userId: string, requestBody: ResumeRequestBody) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const userSkills = await prisma.userSkill.findMany({
      where: { uid: userProfile.id },
      include: { skill: true },
    });

    const desirePositions = await prisma.desirePosition.findMany({
      where: { uid: userProfile.id },
      include: { position: true },
    });

    const geminiInput = {
      ...requestBody,
      name: userProfile.nickname,
      skills: [
        ...userSkills.map((us) => us.skill.name),
        ...(Array.isArray(userProfile.customSkill)
          ? userProfile.customSkill.filter((s): s is string => typeof s === "string")
          : []),
      ],
      position: [
        ...desirePositions.map((dp) => dp.position.name),
        ...(Array.isArray(userProfile.customPosition)
          ? userProfile.customPosition.filter((p): p is string => typeof p === "string")
          : []),
      ].join(", "),
      summary: userProfile.summary ?? "",
    };

    const prompt = buildNarrativeJsonPrompt(geminiInput);
    const aiResult = await generateGeminiText(prompt);
    const parsed = JSON.parse(aiResult);

    return resumeRepository.createResume(
      userProfile.id,
      requestBody.experienceNote,
      {
        ...parsed,
        positions: parsed.positions, // position 이름 배열 그대로 넘김
      }
    );
  },

  getResumesByUserId: async (userId: string) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    return resumeRepository.getResumesByProfile(userProfile.id);
  },

  getResumeById: async (resumeId: string) => {
    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume) throw new Error("해당 이력서를 찾을 수 없습니다.");
    return resume;
  },

  updateResume: async (
    resumeId: string,
    userId: string,
    updateData: Partial<ResumeRequestBody>
  ) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.profileId !== userProfile.id) {
      throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");
    }

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

    // 스칼라 필드 업데이트
    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (summary !== undefined) updatePayload.summary = summary;
    if (experienceNote !== undefined) updatePayload.experienceNote = experienceNote;
    if (isPublic !== undefined) updatePayload.isPublic = isPublic;
    if (theme !== undefined) updatePayload.theme = theme;

    // 관계 필드 처리
    if (categories) {
      updatePayload.categories = {
        set: categories.map((name) => ({ name })),
      };
    }

    if (skills) {
      updatePayload.skills = {
        set: skills.map((name) => ({ name })),
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

    // 이력서 업데이트
    await prisma.resume.update({
      where: { id: resumeId },
      data: updatePayload,
    });

    // 1:N 관계 처리 (완전 교체 방식)
    if (projects) {
      await prisma.project.deleteMany({ where: { resumeId } });
      await prisma.project.createMany({
        data: projects.map((p) => ({ ...p, resumeId })),
      });
    }

    if (activities) {
      await prisma.developmentActivity.deleteMany({ where: { resumeId } });
      await prisma.developmentActivity.createMany({
        data: activities.map((a) => ({ ...a, resumeId })),
      });
    }

    if (certificates) {
      await prisma.certificate.deleteMany({ where: { resumeId } });
      await prisma.certificate.createMany({
        data: certificates.map((c) => ({
          name: c.name,
          date: c.date ? new Date(c.date) : undefined,
          grade: c.grade,
          issuer: c.issuer,
          resumeId,
        })),
      });
    }

    return resumeRepository.getResumeById(resumeId);
  },

  deleteResume: async (resumeId: string, userId: string) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.profileId !== userProfile.id) {
      throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
    }

    return resumeRepository.deleteResume(resumeId);
  },
};
