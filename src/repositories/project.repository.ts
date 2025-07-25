import { Prisma, ProjectStatus } from '@prisma/client';
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
    imgUrl?: string;
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
        imgUrl: data.imgUrl,
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
    imgUrl?: string;
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
        imgUrl: data.imgUrl,
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
      sortBy?: string;
      //sortOrder?: string;
    },
  ) {
    const andConditions: any[] = [];
    
    if (query.ownerId) {
      andConditions.push({
        userId: query.ownerId,
      });
    }

    if (query.skill && query.skill.length > 0) {
      andConditions.push({
        OR: [
          {
            generalSkills: {
              some: {
                skill: {
                  name: { in: query.skill },
                }
              },
            },
          },
          {
            customSkills: {
              hasSome: query.skill,
            },
          }
        ],
      });
    }

    if (query.favorite) {
      andConditions.push({
        favorites: {
          some: {
            userId: userId,
          },
        },
      });
    }

    if (query.tag && query.tag.length > 0) {
      andConditions.push({
        tags: {
          hasSome: query.tag,
        },
      });
    }

    if (query.desc) {
      andConditions.push({
        OR: [
          { projectName: { contains: query.desc, mode: 'insensitive' } },
          { projectDesc: { contains: query.desc, mode: 'insensitive' } },
        ],
      });
    }

    // 공개 조건
    const orCondition = [
      { isPublic: true },
      { userId },
    ];

    const where: any = {};

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    where.OR = orCondition;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    let orderByCondition: Prisma.ProjectOrderByWithRelationInput;

    if (query.sortBy === 'popular') {
      orderByCondition = {
        favorites: {
          _count: 'desc',
        },
      };
    } else {
      orderByCondition = {
        createdAt: 'desc',
      };
    }


    return prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderByCondition,
      include: {
        generalSkills: {
          include: {
            skill: true,
          },
        },
        user: {
          select: {
            profile: {
              select: {
                nickname: true,
                imageUrl: true
              }
            }
          },
        },
        favorites: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });
  }

  async toggleFavorite(userId: string, projectId: string, like: boolean) {
    const [userExists, projectExists] = await Promise.all([
      prisma.userAuth.findUnique({ where: { id: userId } }),
      prisma.project.findUnique({ where: { id: projectId } }),
    ]);

    if (!userExists) {
      const error: any = new Error('존재하지 않는 사용자입니다.');
      error.status = 404;
      throw error;
    }
    if (!projectExists) {
      const error: any = new Error('존재하지 않는 프로젝트입니다.');
      error.status = 404;
      throw error;
    }

    const favorite = await prisma.projectFavorite.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (like) {
      if (favorite) return false;
      await prisma.projectFavorite.create({
        data: {
          userId,
          projectId,
        },
      });
      return true;
    } else {
      if (!favorite) return false;
      await prisma.projectFavorite.delete({
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
