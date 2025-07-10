import prisma from "../lib/prisma";
import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import { ResumeRequestBody } from "../../types/resume";

export const resumeService = {
  createResumeWithAI: async (userId: string, requestBody: ResumeRequestBody) => {
    console.log("[createResumeWithAI] 시작 - userId:", userId);
    console.log("[createResumeWithAI] requestBody:", JSON.stringify(requestBody, null, 2));

    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");
    console.log("[createResumeWithAI] userProfile:", JSON.stringify(userProfile, null, 2));

    // userSkills, desirePositions 받아오기
    const userSkills = await prisma.userSkill.findMany({
      where: { user: { id: userProfile.id } },
      include: { skill: true },
    });
    const desirePositions = await prisma.desirePosition.findMany({
      where: { user: { id: userProfile.id } },
      include: { position: true },
    });

    // 배열 보장 (DB에서 없으면 requestBody에서)
    const skills = userSkills.length > 0
      ? userSkills.map((us) => us.skill.name)
      : (Array.isArray(requestBody.skills) ? requestBody.skills : []);

    const positions = desirePositions.length > 0
      ? desirePositions.map((dp) => dp.position.name)
      : (Array.isArray(requestBody.positions) ? requestBody.positions : []);

    const categories = Array.isArray(requestBody.categories) ? requestBody.categories : [];
    const projects = Array.isArray(requestBody.projects) ? requestBody.projects : [];
    const activities = Array.isArray(requestBody.activities) ? requestBody.activities : [];
    const certificates = Array.isArray(requestBody.certificates) ? requestBody.certificates : [];

    console.log("[createResumeWithAI] merged skills:", skills);
    console.log("[createResumeWithAI] merged positions:", positions);

    const geminiInput = {
      ...requestBody,
      name: userProfile.nickname,
      categories,
      skills,
      positions,
      summary: userProfile.summary ?? "",
      projects,
      activities,
      certificates,
    };

    console.log("[createResumeWithAI] geminiInput for AI:", JSON.stringify(geminiInput, null, 2));

    const prompt = buildNarrativeJsonPrompt(geminiInput);
    console.log("[createResumeWithAI] prompt sent to AI:", prompt);

    const aiResult = await generateGeminiText(prompt);
    console.log("[createResumeWithAI] raw AI result:", aiResult);

    let parsed;
    try {
      // AI 결과에서 ```json ... ``` 부분 제거
      const cleaned = aiResult
        .replace(/^```json/, '')   // 시작 부분 ```json 제거
        .replace(/^```/, '')       // 시작 부분 ``` 제거 (만약 ```json 없으면)
        .replace(/```$/, '')       // 끝부분 ``` 제거
        .trim();

      parsed = JSON.parse(cleaned);
      console.log("[createResumeWithAI] parsed AI result:", JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("[createResumeWithAI] Failed to parse Gemini response:", aiResult, error);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
    }

    const createdResume = await resumeRepository.createResume(
      userProfile.id,
      requestBody.experienceNote ?? "",
      parsed
    );
    console.log("[createResumeWithAI] createdResume from DB:", JSON.stringify(createdResume, null, 2));

    return {
      ...createdResume,
      skills,
      positions,
    };
  },



  getResumesByUserId: async (userId: string) => {
    console.log("[getResumesByUserId] 시작 - userId:", userId);

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) {
      console.error("[getResumesByUserId] 프로필이 존재하지 않습니다.");
      throw new Error("프로필이 존재하지 않습니다.");
    }
    console.log("[getResumesByUserId] userProfile found:", JSON.stringify(userProfile, null, 2));

    const resumes = await resumeRepository.getResumesByProfile(userProfile.id);
    console.log("[getResumesByUserId] resumes found:", JSON.stringify(resumes, null, 2));

    return resumes;
  },

  getResumeById: async (resumeId: string) => {
    console.log("[getResumeById] 시작 - resumeId:", resumeId);

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume) {
      console.error("[getResumeById] 해당 이력서를 찾을 수 없습니다.");
      throw new Error("해당 이력서를 찾을 수 없습니다.");
    }
    console.log("[getResumeById] resume found:", JSON.stringify(resume, null, 2));

    return resume;
  },

  updateResume: async (
    resumeId: string,
    userId: string,
    updateData: Partial<ResumeRequestBody>
  ) => {
    console.log("[updateResume] 시작 - resumeId:", resumeId, "userId:", userId);
    console.log("[updateResume] updateData:", JSON.stringify(updateData, null, 2));

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) {
      console.error("[updateResume] 프로필이 존재하지 않습니다.");
      throw new Error("프로필이 존재하지 않습니다.");
    }
    console.log("[updateResume] userProfile found:", JSON.stringify(userProfile, null, 2));

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) {
      console.error("[updateResume] 수정 권한이 없거나 이력서를 찾을 수 없습니다.");
      throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");
    }
    console.log("[updateResume] resume found:", JSON.stringify(resume, null, 2));

    const updatedResume = await resumeRepository.updateResume(resumeId, updateData);
    console.log("[updateResume] updatedResume:", JSON.stringify(updatedResume, null, 2));

    return updatedResume;
  },

  deleteResume: async (resumeId: string, userId: string) => {
    console.log("[deleteResume] 시작 - resumeId:", resumeId, "userId:", userId);

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    if (!userProfile) {
      console.error("[deleteResume] 프로필이 존재하지 않습니다.");
      throw new Error("프로필이 존재하지 않습니다.");
    }
    console.log("[deleteResume] userProfile found:", JSON.stringify(userProfile, null, 2));

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) {
      console.error("[deleteResume] 삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
      throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");
    }
    console.log("[deleteResume] resume found:", JSON.stringify(resume, null, 2));

    const deleted = await resumeRepository.deleteResume(resumeId);
    console.log("[deleteResume] 삭제 완료:", JSON.stringify(deleted, null, 2));

    return deleted;
  },

  getAllResumes: async () => {
    console.log("[getAllResumes] 시작 - 공개 이력서 전체 조회");

    const resumes = await resumeRepository.getAllPublicResumes();
    console.log("[getAllResumes] 조회된 이력서 개수:", resumes.length);

    return resumes;
  },

  getPublicResumesByTitleSearch: async (searchTerm?: string) => {
    console.log("[getPublicResumesByTitleSearch] 시작 - searchTerm:", searchTerm);

    if (!searchTerm) {
      console.warn("[getPublicResumesByTitleSearch] searchTerm이 없어서 빈 배열 반환");
      return [];
    }

    const resumes = await resumeRepository.getPublicResumesByTitleSearch(searchTerm);
    console.log("[getPublicResumesByTitleSearch] 조회된 이력서 개수:", resumes.length);

    return resumes;
  },
};
