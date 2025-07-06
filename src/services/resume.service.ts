import prisma from "../lib/prisma";
import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import { ResumeRequestBody } from "../../types/resume";

export const resumeService = {
  createResumeWithAI: async (userId: string, requestBody: ResumeRequestBody) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const userSkills = await prisma.userSkill.findMany({
      where: { user: {id: userProfile.id} },
      include: { skill: true },
    });

    const desirePositions = await prisma.desirePosition.findMany({
      where: { user: {id: userProfile.id} }, 
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

    let parsed;
    try {
      parsed = JSON.parse(aiResult);
    } catch (error) {
      console.error("Failed to parse Gemini response:", aiResult, error);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
    }

    return resumeRepository.createResume(
      userProfile.id,
      requestBody.experienceNote ?? "",
      {
        ...parsed,
        positions: parsed.positions,
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
    updateData: ResumeRequestBody
  ) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) {
      throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");
    }

    return resumeRepository.updateResume(resumeId, updateData);
  },

  deleteResume: async (resumeId: string, userId: string) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) {
      throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
    }

    return resumeRepository.deleteResume(resumeId);
  },

  getAllResumes: async () => {
    return resumeRepository.getAllPublicResumes();
  },

  getPublicResumesByTitleSearch: async (searchTerm?: string) => {
    if (!searchTerm) {
      return []; // 검색어 없으면 빈 배열 반환하거나 전체 반환하도록 변경 가능
    }

    return resumeRepository.getPublicResumesByTitleSearch(searchTerm);
  },
};
