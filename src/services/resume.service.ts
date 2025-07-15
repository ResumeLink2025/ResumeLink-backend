// resume.service.ts
import prisma from "../lib/prisma";
import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import type { ResumeRequestBody } from "../../types/resume";

export const resumeService = {
  createResumeWithAI: async (userId: string, requestBody: ResumeRequestBody) => {
    console.log("[createResumeWithAI] 시작 - userId:", userId);
    console.log("[createResumeWithAI] requestBody:", JSON.stringify(requestBody, null, 2));

    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");
    console.log("[createResumeWithAI] userProfile:", JSON.stringify(userProfile, null, 2));

    // 프론트에서 넘어온 데이터 그대로 사용
    const skills = Array.isArray(requestBody.skills) ? requestBody.skills : [];
    const positions = Array.isArray(requestBody.positions) ? requestBody.positions : [];
    const categories = Array.isArray(requestBody.categories) ? requestBody.categories : [];
    const projects = Array.isArray(requestBody.projects) ? requestBody.projects : [];
    const activities = Array.isArray(requestBody.activities) ? requestBody.activities : [];
    const certificates = Array.isArray(requestBody.certificates) ? requestBody.certificates : [];

    console.log("[createResumeWithAI] skills:", skills);
    console.log("[createResumeWithAI] positions:", positions);

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
      const cleaned = aiResult
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

      parsed = JSON.parse(cleaned);
      console.log("[createResumeWithAI] parsed AI result:", JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("[createResumeWithAI] Failed to parse Gemini response:", aiResult, error);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
    }

    // 매핑 함수들 사용하여 DB에 넣을 데이터 형태로 변환
    const mappedProjects = mapProjects(parsed.projects ?? []);
    const mappedActivities = mapActivities(parsed.activities ?? []);
    const mappedCertificates = mapCertificates(parsed.certificates ?? []);

    const createdResume = await resumeRepository.createResume(
      userProfile.id,
      requestBody.experienceNote ?? "",
      {
        ...parsed,
        projects: mappedProjects,
        activities: mappedActivities,
        certificates: mappedCertificates,
      }
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

    return resumes.map(formatResumeData);
  },

  getResumeById: async (resumeId: string) => {
    console.log("[getResumeById] 시작 - resumeId:", resumeId);

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume) {
      console.error("[getResumeById] 해당 이력서를 찾을 수 없습니다.");
      throw new Error("해당 이력서를 찾을 수 없습니다.");
    }
    console.log("[getResumeById] resume found:", JSON.stringify(resume, null, 2));

    return formatResumeData(resume);
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

    // 매핑 함수 사용
    const mappedProjects = updateData.projects ? mapProjects(updateData.projects) : undefined;
    const mappedActivities = updateData.activities ? mapActivities(updateData.activities) : undefined;
    const mappedCertificates = updateData.certificates ? mapCertificates(updateData.certificates) : undefined;

    const updatedResume = await resumeRepository.updateResume(resumeId, {
      ...updateData,
      projects: mappedProjects,
      activities: mappedActivities,
      certificates: mappedCertificates,
    });
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

    // 배열 각각 포맷 적용
    return resumes.map(formatResumeData);
  },

  getPublicResumesByTitleSearch: async (searchTerm?: string) => {
    console.log("[getPublicResumesByTitleSearch] 시작 - searchTerm:", searchTerm);

    if (!searchTerm) {
      console.warn("[getPublicResumesByTitleSearch] searchTerm이 없어서 빈 배열 반환");
      return [];
    }

    const resumes = await resumeRepository.getPublicResumesByTitleSearch(searchTerm);
    console.log("[getPublicResumesByTitleSearch] 조회된 이력서 개수:", resumes.length);

    return resumes.map(formatResumeData);
  },
};

// 매핑 함수들

function mapProjects(projects: any[]) {
  return projects.map((proj) => ({
    id: proj.id,
    aiDescription: proj.projectDesc ?? proj.aiDescription ?? "",
    generalSkills: proj.generalSkills ?? [],
    customSkills: proj.customSkills ?? [],
  }));
}

function mapActivities(activities: any[]) {
  return activities.map((act) => {
    if (!act.startDate) throw new Error("활동의 시작일(startDate)은 필수입니다.");
    return {
      title: act.title,
      description: act.description ?? "",
      startDate: new Date(act.startDate),
      endDate: act.endDate ? new Date(act.endDate) : undefined,
    };
  });
}

function mapCertificates(certificates: any[]) {
  return certificates.map((cert) => {
    return {
      name: cert.name,
      date: cert.date ? new Date(cert.date) : undefined,
      grade: cert.grade ?? "",
      issuer: cert.issuer ?? "",
    };
  });
}

// DB에서 불러온 이력서 데이터를 프론트용으로 깔끔히 포맷
function formatResumeData(raw: any) {
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    summary: raw.summary,
    experienceNote: raw.experienceNote,
    theme: raw.theme,
    isPublic: raw.isPublic,
    categories: raw.categories,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    skills: raw.skills?.map((item: any) => item.skill.name) ?? [],
    positions: raw.positions?.map((item: any) => item.position.name) ?? [],
    projects: raw.projects?.map((prj: any) => ({
      projectName: prj.project?.projectName ?? "",
      projectDesc: prj.project?.projectDesc ?? "",
      generalSkills: prj.project?.generalSkills?.map((gs: any) => gs.skill?.name ?? "") ?? [],
      customSkills: prj.project?.customSkills ?? [],
      role: prj.project?.role ?? "",
    })) ?? [],
    activities: raw.activities?.map((act: any) => ({
      title: act.title,
      description: act.description ?? "",
      startDate: act.startDate,
      endDate: act.endDate,
    })) ?? [],
    certificates: raw.certificates?.map((cert: any) => ({
      name: cert.name,
      date: cert.date,
      grade: cert.grade,
      issuer: cert.issuer,
    })) ?? [],
  };
}
