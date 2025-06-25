import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import { ResumeRequestBody } from "../../types/resume";

export const resumeService = {
  createResumeWithAI: async (profileId: string, requestBody: ResumeRequestBody) => {
    const userProfile = await resumeRepository.getProfile(profileId);
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const geminiInput = {
      ...requestBody,
      name: userProfile.nickname,
      position: userProfile.customPosition ?? "",
      techStacks: userProfile.customSkill ?? [],
      summary: userProfile.summary ?? "",
    };

    const prompt = buildNarrativeJsonPrompt(geminiInput);
    const aiResult = await generateGeminiText(prompt);
    const parsed = JSON.parse(aiResult);

    return resumeRepository.createResume(profileId, requestBody.experienceNote, parsed);
  },
    getResumesByUserId: async (userId: string) => {
    return resumeRepository.getResumesByProfile(userId);
  },

  // 단일 이력서 조회
  getResumeById: async (resumeId: string) => {
    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume) throw new Error("해당 이력서를 찾을 수 없습니다.");
    return resume;
  },

  // 이력서 수정
  updateResume: async (
    resumeId: string,
    profileId: string,
    updateData: Partial<ResumeRequestBody>
  ) => {
    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.profileId !== profileId) {
      throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");
    }

    return resumeRepository.updateResume(resumeId, updateData);
  },

  // 이력서 삭제
  deleteResume: async (resumeId: string, profileId: string) => {
    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.profileId !== profileId) {
      throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
    }

    return resumeRepository.deleteResume(resumeId);
  },
};