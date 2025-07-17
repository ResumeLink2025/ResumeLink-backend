import prisma from "../lib/prisma";
import { buildNarrativeJsonPrompt } from "../utils/prompt";
import { generateGeminiText } from "../lib/gemini";
import { resumeRepository } from "../repositories/resume.repository";
import type { AiProjectInfo, ResumeRequestBody } from "../../types/resume";

interface ProjectInput {
  id?: string;
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
  startDate?: string | Date;
  endDate?: string | Date;
}

interface CertificateInput {
  name: string;
  date?: string | Date;
  grade?: string;
  issuer?: string;
}

interface RawResume {
  id: string;
  userId: string;
  title: string;
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
}

function convertGeneralSkills(skills: string[]): SkillInput[] {
  return skills.map((name) => ({ skill: { name } }));
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

function mapProjects(projects: ProjectInput[]): {
  id?: string;
  aiDescription: string;
  generalSkills: SkillInput[];
  customSkills: string[];
}[] {
  return projects.map((proj) => ({
    id: proj.id,
    aiDescription: proj.projectDesc ?? proj.aiDescription ?? "",
    generalSkills: proj.generalSkills ?? [],
    customSkills: proj.customSkills ?? [],
  }));
}

function mapActivities(activities: ActivityInput[]): {
  title: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
}[] {
  return activities.map((act) => ({
    title: act.title,
    description: act.description ?? "",
    startDate: act.startDate ? (typeof act.startDate === "string" ? new Date(act.startDate) : act.startDate) : undefined,
    endDate: act.endDate ? (typeof act.endDate === "string" ? new Date(act.endDate) : act.endDate) : undefined,
  }));
}

function mapCertificates(certificates: CertificateInput[]): {
  name: string;
  date?: Date;
  grade: string;
  issuer: string;
}[] {
  return certificates.map((cert) => ({
    name: cert.name,
    date: cert.date ? (typeof cert.date === "string" ? new Date(cert.date) : cert.date) : undefined,
    grade: cert.grade ?? "",
    issuer: cert.issuer ?? "",
  }));
}

function formatResumeData(raw: RawResume & { user: { profile: { nickname: string; imageUrl: string | null } | null; }; favoriteCount?: number; isFavorited?: boolean }) {
  return {
    id: raw.id,
    userId: raw.userId,
    nickname: raw.user?.profile?.nickname,
    imageUrl: raw.user?.profile?.imageUrl ?? null,
    title: raw.title,
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
      startDate: act.startDate,
      endDate: act.endDate ?? undefined,
    })) ?? [],
    certificates: raw.certificates?.map((cert) => ({
      name: cert.name,
      date: cert.date ?? undefined,
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
        isPublic: requestBody.isPublic ?? false,
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
  console.log("[getResumesByUserId] 시작 - userId:", userId);

  const userProfile = await prisma.userProfile.findUnique({
    where: { id: userId },
  });
  if (!userProfile) {
    console.error("[getResumesByUserId] 프로필이 존재하지 않습니다.");
    throw new Error("프로필이 존재하지 않습니다.");
  }

  const resumes = await resumeRepository.getResumesByProfile(userProfile.id);
  if (resumes.length === 0) return [];

  // 이력서 ID 배열 추출
  const resumeIds = resumes.map(r => r.id);

  // 좋아요 수를 한 번에 조회
  const favoriteCountsRaw = await prisma.resumeFavorite.groupBy({
    by: ['resumeId'],
    where: { resumeId: { in: resumeIds } },
    _count: { resumeId: true },
  });

  // 좋아요 수를 매핑할 객체 생성
  const favoriteCounts = favoriteCountsRaw.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.resumeId] = cur._count.resumeId;
    return acc;
  }, {});

  // 현재 사용자가 좋아요한 이력서 ID 목록 한 번에 조회
  const userFavorites = await prisma.resumeFavorite.findMany({
    where: { userId, resumeId: { in: resumeIds } },
    select: { resumeId: true },
  });

  const userFavoritedSet = new Set(userFavorites.map(fav => fav.resumeId));

  // 메모리에서 좋아요 수와 좋아요 여부를 매핑하여 리턴
  const result = resumes.map(resume => {
    return formatResumeData({
      ...resume,
      favoriteCount: favoriteCounts[resume.id] ?? 0,
      isFavorited: userFavoritedSet.has(resume.id),
    });
  });

  return result;
},


  getResumeById: async (resumeId: string, userId?: string) => {
    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume) throw new Error("해당 이력서를 찾을 수 없습니다.");
    const favoriteCount = await resumeRepository.countFavorites(resumeId);
    const isFavorited = userId ? await resumeRepository.isFavoritedByUser(userId, resumeId) : false;

    return formatResumeData({
      ...resume,
      favoriteCount,
      isFavorited,
    });
  },

  updateResume: async (
    resumeId: string,
    userId: string,
    updateData: Partial<ResumeRequestBody>
  ) => {
    const userProfile = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userProfile) throw new Error("프로필이 존재하지 않습니다.");

    const resume = await resumeRepository.getResumeById(resumeId);
    if (!resume || resume.userId !== userProfile.id) throw new Error("수정 권한이 없거나 이력서를 찾을 수 없습니다.");

    // 여기서만 generalSkills string[] → SkillInput[] 변환
    const mappedProjects = updateData.projects
      ? mapProjects(convertProjectsForUpdate(updateData.projects as AiProjectInfo[]))
      : undefined;

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

  getAllResumes: async (userId?: string) => {
  const resumes = await resumeRepository.getAllPublicResumes();
  if (resumes.length === 0) return [];

  const resumeIds = resumes.map(r => r.id);

  const favoriteCountsRaw = await prisma.resumeFavorite.groupBy({
    by: ['resumeId'],
    where: { resumeId: { in: resumeIds } },
    _count: { resumeId: true },
  });

  const favoriteCounts = favoriteCountsRaw.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.resumeId] = cur._count.resumeId;
    return acc;
  }, {});

  let userFavoritedSet = new Set<string>();
  if (userId) {
    const userFavorites = await prisma.resumeFavorite.findMany({
      where: { userId, resumeId: { in: resumeIds } },
      select: { resumeId: true },
    });
    userFavoritedSet = new Set(userFavorites.map(fav => fav.resumeId));
  }

  return resumes.map(resume =>
    formatResumeData({
      ...resume,
      favoriteCount: favoriteCounts[resume.id] ?? 0,
      isFavorited: userFavoritedSet.has(resume.id),
    })
  );
},

  getPublicResumesByTitleSearch: async (
    searchTerm?: string,
    skillNames?: string[],
    positionNames?: string[],
    userId?: string
  ) => {
    console.log("[getPublicResumesByTitleSearch] 시작 - searchTerm:", searchTerm, "skillNames:", skillNames, "positionNames:", positionNames);

    const resumes = await resumeRepository.getPublicResumesByTitleSearch(
      searchTerm,
      skillNames,
      positionNames,
    );

    console.log("[getPublicResumesByTitleSearch] 조회된 이력서 개수:", resumes.length);

    const result = await Promise.all(
      resumes.map(async (resume) => {
        const favoriteCount = await resumeRepository.countFavorites(resume.id);
        const isFavorited = userId ? await resumeRepository.isFavoritedByUser(userId, resume.id) : false;

        return formatResumeData({
          ...resume,
          favoriteCount,
          isFavorited,
        });
      })
    );

    return result;
  },

  toggleFavorite: async (userId: string, resumeId: string) => {
    const isFavorited = await resumeRepository.isFavoritedByUser(userId, resumeId);
    if (isFavorited) {
      await resumeRepository.removeFavorite(userId, resumeId);
      return { favorited: false };
    } else {
      await resumeRepository.addFavorite(userId, resumeId);
      return { favorited: true };
    }
  },

  getFavoriteCount: async (resumeId: string) => {
    return resumeRepository.countFavorites(resumeId);
  }

};

