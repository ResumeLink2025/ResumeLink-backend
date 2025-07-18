import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import type { AiProjectInfo, ResumeRequestBody } from "../../types/resume";

interface ProjectInput {
  id: string;
  projectDesc?: string;
  aiDescription?: string;
  generalSkills?: SkillInput[];
  customSkills?: string[];
  projectName?: string;
  role?: string;
}

interface SkillInput {
  skill?: {
    name: string;
  };
}

interface ActivityInput {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface CertificateInput {
  name: string;
  date?: string;
  grade?: string;
  issuer?: string;
}

interface RawResume {
  id: string;
  userId: string;
  title: string;
  resumeImgUrl?: string | null;
  summary?: string | null;
  experienceNote?: string | null;
  theme?: string | null;
  isPublic: boolean;
  categories?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  skills?: { skill: { name: string } }[];
  positions?: { position: { name: string } }[];
  projects?: {
    project?: {
      id?: string;
      projectName?: string | null;
      projectDesc?: string | null;
      generalSkills?: { skill?: { name?: string } }[];
      customSkills?: string[];
      role?: string | null;
    };
  }[];
  activities?: {
    title: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  }[];
  certificates?: {
    name: string;
    date?: Date | null;
    grade?: string | null;
    issuer?: string | null;
  }[];
  favoriteCount?: number;
}

function convertProjectsForUpdate(aiProjects: AiProjectInfo[]): ProjectInput[] {
  return aiProjects.map(proj => ({
    id: proj.id,
    projectName: proj.projectName,
    projectDesc: proj.projectDesc,
    role: proj.role,
    generalSkills: (proj.generalSkills ?? []).map(name => ({ skill: { name } })),
    customSkills: proj.customSkills ?? [],
  }));
}

function mapProjects(projects: ProjectInput[]): AiProjectInfo[] {
  return projects.map((proj) => ({
    id: proj.id,
    projectName: proj.projectName ?? "",
    aiDescription: proj.projectDesc ?? proj.aiDescription ?? "",
    role: proj.role ?? "",
    generalSkills: proj.generalSkills?.map(s => s.skill?.name ?? "") ?? [],
    customSkills: proj.customSkills ?? [],
  }));
}

function mapActivities(activities: ActivityInput[]): ActivityInput[] {
  return activities.map((act) => ({
    title: act.title,
    description: act.description ?? "",
    startDate: act.startDate,
    endDate: act.endDate,
  }));
}

function mapCertificates(certificates: CertificateInput[]): CertificateInput[] {
  return certificates.map((cert) => ({
    name: cert.name,
    date: cert.date,
    grade: cert.grade ?? "",
    issuer: cert.issuer ?? "",
  }));
}

function formatResumeData(raw: RawResume & { user: { profile: { nickname: string; imageUrl: string | null } | null; }; isFavorited?: boolean }) {
  return {
    id: raw.id,
    userId: raw.userId,
    nickname: raw.user?.profile?.nickname,
    imageUrl: raw.user?.profile?.imageUrl ?? null,
    title: raw.title,
    resumeImgUrl: raw.resumeImgUrl ?? null,
    summary: raw.summary ?? undefined,
    experienceNote: raw.experienceNote ?? undefined,
    theme: raw.theme ?? undefined,
    isPublic: raw.isPublic,
    categories: raw.categories ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    skills: raw.skills?.map((item) => item.skill.name) ?? [],
    positions: raw.positions?.map((item) => item.position.name) ?? [],
    projects: raw.projects?.map((prj) => ({
      id: prj.project?.id,
      projectName: prj.project?.projectName ?? "",
      projectDesc: prj.project?.projectDesc ?? "",
      generalSkills: prj.project?.generalSkills?.map((gs) => gs.skill?.name ?? "") ?? [],
      customSkills: prj.project?.customSkills ?? [],
      role: prj.project?.role ?? "",
    })) ?? [],
    activities: raw.activities?.map((act) => ({
      title: act.title,
      description: act.description ?? "",
      startDate: act.startDate ? act.startDate.toISOString() : undefined,
      endDate: act.endDate ? act.endDate.toISOString() : undefined,
    })) ?? [],
    certificates: raw.certificates?.map((cert) => ({
      name: cert.name,
      date: cert.date ? cert.date.toISOString() : undefined,
      grade: cert.grade,
      issuer: cert.issuer,
    })) ?? [],
    favoriteCount: raw.favoriteCount ?? 0,
    isFavorited: raw.isFavorited ?? false,
  };
}

// --- 서비스 함수 및 매핑 함수 구현 ---

export const resumeService = {
  createResumeWithAI: async (userId: string, requestBody: ResumeRequestBody) => {
    console.log("[createResumeWithAI] 시작 - userId:", userId);
    console.log("[createResumeWithAI] 입력 requestBody:", JSON.stringify(requestBody, null, 2));

    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) {
      console.error("[createResumeWithAI] 프로필 없음 - userId:", userId);
      throw new Error("프로필이 존재하지 않습니다.");
    }
    const skills = Array.isArray(requestBody.skills) ? requestBody.skills : [];
    const positions = Array.isArray(requestBody.positions) ? requestBody.positions : [];
    const categories = Array.isArray(requestBody.categories) ? requestBody.categories : [];
    const projects = Array.isArray(requestBody.projects) ? requestBody.projects : [];
    const activities = Array.isArray(requestBody.activities) ? requestBody.activities : [];
    const certificates = Array.isArray(requestBody.certificates) ? requestBody.certificates : [];

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

    const prompt = buildNarrativeJsonPrompt(geminiInput);

    const aiResult = await generateGeminiText(prompt);

    let parsed;
    try {
      const cleaned = aiResult
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error("[createResumeWithAI] AI 응답 파싱 실패:", aiResult, error);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
    }

    const mappedProjects = mapProjects(parsed.projects ?? []);
    const mappedActivities = mapActivities(parsed.activities ?? []);
    const mappedCertificates = mapCertificates(parsed.certificates ?? []);

    const createdResume = await resumeRepository.createResume(
      userProfile.id,
      requestBody.experienceNote ?? "",
      {
        ...parsed,
        title: requestBody.title ?? "AI 생성 이력서",
        resumeImgUrl: requestBody.resumeImgUrl ?? userProfile.imageUrl ?? null,
        isPublic: requestBody.isPublic ?? false,
        theme: requestBody.theme ?? "light",
        projects: mappedProjects,
        activities: mappedActivities,
        certificates: mappedCertificates,
      }
    );
    console.log("[createResumeWithAI] DB 저장 완료, 생성된 이력서:", JSON.stringify(createdResume, null, 2));

    return {
      ...createdResume,
      skills,
      positions,
    };
  },

  getResumesByUserId: async (userId: string) => {
    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resumes = await resumeRepository.getResumesByProfile(userProfile.id);
    if (resumes.length === 0) return [];

    const resumeIds = resumes.map(r => r.id);
    const userFavorites = await resumeRepository.getUserFavorites(userId, resumeIds);
    const userFavoritedSet = new Set(userFavorites.map(fav => fav.resumeId));

    return resumes.map(resume =>
      formatResumeData({
        ...resume,
        favoriteCount: resume.favoriteCount ?? 0,
        isFavorited: userFavoritedSet.has(resume.id),
      })
    );
  },

  getResumeById: async (resumeId: string, userId?: string) => {
    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume) throw new Error("해당 이력서를 찾을 수 없습니다.");

    const isFavorited = userId ? await resumeRepository.isFavoritedByUser(userId, resumeId) : false;

    return formatResumeData({
      ...resume,
      favoriteCount: resume.favoriteCount ?? 0,
      isFavorited,
    });
  },

  updateResume: async (resumeId: string, userId: string, updateData: Partial<ResumeRequestBody>) => {
    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");

    const mappedProjects = updateData.projects ? mapProjects(convertProjectsForUpdate(updateData.projects)) : undefined;
    const mappedActivities = updateData.activities ? mapActivities(updateData.activities) : undefined;
    const mappedCertificates = updateData.certificates ? mapCertificates(updateData.certificates) : undefined;

    const updatedResume = await resumeRepository.updateResume(resumeId, {
      ...updateData,
      projects: mappedProjects,
      activities: mappedActivities,
      certificates: mappedCertificates,
    });

    return updatedResume;
  },

  deleteResume: async (resumeId: string, userId: string) => {
    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) throw new Error("삭제 권한이 없거나 이력서를 찾을 수 없습니다.");

    return await resumeRepository.deleteResume(resumeId);
  },

  getAllResumes: async (userId?: string) => {
    const resumes = await resumeRepository.getAllPublicResumes();
    if (resumes.length === 0) return [];

    const resumeIds = resumes.map(r => r.id);
    const userFavorites = userId ? await resumeRepository.getUserFavorites(userId, resumeIds) : [];
    const userFavoritedSet = new Set(userFavorites.map(fav => fav.resumeId));

    return resumes.map(resume =>
      formatResumeData({
        ...resume,
        favoriteCount: resume.favoriteCount ?? 0,
        isFavorited: userFavoritedSet.has(resume.id),
      })
    );
  },

  getPublicResumesByTitleSearch: async (
    searchTerm?: string,
    skillNames?: string[],
    positionNames?: string[],
    userId?: string,
    sortBy: string = "latest"
  ) => {
    const orderBy: Prisma.ResumeOrderByWithRelationInput =
      sortBy === "popular"
        ? { favoriteCount: "desc" }
        : { createdAt: "desc" };

    const resumes = await resumeRepository.getPublicResumesByTitleSearch(
      searchTerm,
      skillNames,
      positionNames,
      orderBy
    );

    if (resumes.length === 0) return [];

    const resumeIds = resumes.map(r => r.id);
    const userFavorites = userId ? await resumeRepository.getUserFavorites(userId, resumeIds) : [];
    const userFavoritedSet = new Set(userFavorites.map(fav => fav.resumeId));

    return resumes.map(resume =>
      formatResumeData({
        ...resume,
        favoriteCount: resume.favoriteCount ?? 0,
        isFavorited: userFavoritedSet.has(resume.id),
      })
    );
  },

  toggleFavorite: async (userId: string, resumeId: string) => {
    return prisma.$transaction(async (tx) => {
      const isFavorited = await tx.resumeFavorite.findFirst({
        where: { userId, resumeId },
      });

      if (isFavorited) {
        const deleteResult = await tx.resumeFavorite.deleteMany({ where: { userId, resumeId } });

        if (deleteResult.count > 0) {
          await tx.resume.update({
            where: { id: resumeId },
            data: { favoriteCount: { decrement: 1 } },
          });
        }

        return { favorited: false };
      } else {
        await tx.resumeFavorite.create({ data: { userId, resumeId } });
        await tx.resume.update({
          where: { id: resumeId },
          data: { favoriteCount: { increment: 1 } },
        });

        return { favorited: true };
      }
    });
  }
}

