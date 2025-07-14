import { ProjectStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { contains } from 'class-validator';

interface SkillForm {
  generalSkills: String[],
  customSkills: String[]
}

export class ProjectRepository {
  // 1. 프로젝트 생성
  async create(data: {
    userId: string;
    projectName: string;
    projectDesc: string;
    isPublic: boolean;
    status: ProjectStatus;
    startDate: string;
    endDate: string;
    role: string;
    skill: SkillForm;
    tags: String[];
  }) {


    const general = data.skill.generalSkills as string[]
    const custom = data.skill.customSkills as string[]
    const tag = data.tags as string[]

    const skills = await prisma.skill.findMany({
        where: { name: { in: general } },
        });

    if (skills.length !== general.length) {
        throw new Error('존재하지 않는 Skill이 포함되어 있습니다.');
        }

    const generalSkillId = skills.map(skill => ({
        skill: { connect: { id: skill.id } },
        }));

    const project = await prisma.project.create({
      data: {
        userId: data.userId,
        projectName: data.projectName,
        projectDesc: data.projectDesc,
        isPublic: data.isPublic,
        status: data.status,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        role: data.role,
        customSkills: custom,
        tags: tag,
        generalSkills: {
          create: generalSkillId
        },
      },
      include: {
        generalSkills: true,
      },
    });

    return project;
  }

  // 2. 프로젝트 단건 조회 (기본)
  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  // num to id
  async findNumberToID(projectNumber: number): Promise<string | null> {
    const project = await prisma.project.findUnique({
        where: { projectNumber },
        select: { id: true },
    });

    return project?.id || null;
    }

  // 3. 프로젝트 수정
  async update(id: string, data: {
    userId: string;
    projectName: string;
    projectDesc: string;
    isPublic: boolean;
    status: ProjectStatus;
    startDate: string;
    endDate: string;
    role: string;
    skill: SkillForm;
    tags: String[];
  }) {

    const general = data.skill.generalSkills as string[]
    const custom = data.skill.customSkills as string[]
    const tag = data.tags as string[]

    const skills = await prisma.skill.findMany({
        where: { name: { in: general } },
        });

    if (skills.length !== general.length) {
        throw new Error('존재하지 않는 Skill이 포함되어 있습니다.');
        }

    const generalSkillId = skills.map(skill => ({
        skill: { connect: { id: skill.id } },
        }));

    // 기존 generalSkills 연관관계 삭제
    await prisma.projectSkill.deleteMany({
      where: { projectId: id },
    });

    return prisma.project.update({
      where: { id },
      data: {
        projectName: data.projectName,
        projectDesc: data.projectDesc,
        isPublic: data.isPublic,
        status: data.status,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        role: data.role,
        customSkills: custom,
        tags: tag,
        generalSkills: {
          create: generalSkillId
        },
      },
      include: {
        generalSkills: true,
      },
    });
  }

  // 스택 정보까지 끌어오기
  async findByIdDetail(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { 
        generalSkills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  // 삭제
  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  // 전체 목록 (필터)
  async findProjects(
    userId: string, 
    query: {
        ownerId?: string;
        skill?: string[];
        tag?: string[];
        desc?: string;
        favorite?: boolean;
        page?: number;
        limit?: number;
    }
    ) {
    const where: any = {};


    if (query.ownerId) {
      where.userId = query.ownerId;
    }

    if (query.skill && query.skill.length > 0) {
      where.projectSkills = {
        some: {
          skillId: { in: query.skill },
        },
      };
    }

    if (query.favorite) {
      where.favorites = {
        some: {
          userId: userId,
        },
      };
    }

    if (query.tag && query.tag.length > 0) {
      where.tags = {
        hasSome: query.tag,
      };
    }

    if (query.desc) {
        where.AND = where.AND || [];
        where.AND.push({
            OR: [
                { role: {contains: query.desc, mode: 'insensitive' }},
                { projectDesc: {contains: query.desc, mode: 'insensitive' }}
            ]
        })
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    // 비공개는 본인만
    where.OR = [
      { isPublic: true },
      { userId },
    ];

    return prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        projectName: true,
      },
    });
  }

  // 좋아요 토글
  async toggleFavorite(userId: string, projectId: string, like: boolean) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (like) {
      if (favorite) return false;
      await prisma.favorite.create({
        data: {
          userId,
          projectId,
        },
      });
      return true;
    } else {
      if (!favorite) return false;
      await prisma.favorite.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
      return true;
    }
  }
}