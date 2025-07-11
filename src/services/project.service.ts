import { CreateProjectDto, ProjectDetailDto, UpdateProjectDto } from '../dtos/project.dto';
import { ProjectRepository } from '../repositories/project.repository';
import { plainToInstance } from 'class-transformer';
import { Project, ProjectSkill, ProjectStatus } from '@prisma/client';

interface SkillForm {
  generalSkills: String[],
  customSkills: String[]
}

export class ProjectService {
  constructor(private readonly projectRepository = new ProjectRepository()) {}

  // 1. 프로젝트 생성
  async createProject(userId: string, input: CreateProjectDto) {
    const {
      projectName,
      projectDesc,
      isPublic,
      status,
      startDate,
      endDate,
      role,
      skill,
      tags,
    } = input;

    const project = await this.projectRepository.create({
      userId,
      projectName,
      projectDesc: projectDesc || "",
      isPublic,
      status,
      startDate,
      endDate: endDate || startDate,
      skill: {generalSkills: skill.generalSkills as string[], customSkills: skill.customSkills as string[]},
      role,
      tags
    });

    return project;
  }

  // 2. 프로젝트 수정
  async updateProject(userId: string, projectNumber: number, input: UpdateProjectDto) {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('존재하지 않는 프로젝트입니다.');
    if (project.userId !== userId) throw new Error('수정 권한이 없습니다.');

    const {
      projectName,
      projectDesc,
      isPublic,
      status,
      startDate,
      endDate,
      role,
      skill,
      tags,
    } = input;

    const updated = await this.projectRepository.update(projectId, {
        userId,
        projectName,
        projectDesc: projectDesc || "",
        isPublic,
        status,
        startDate,
        endDate: endDate || startDate,
        role: role,
        skill: {generalSkills: skill.generalSkills as string[], customSkills: skill.customSkills as string[]},
        tags: tags,  
    });

    return updated;
  }

  // 3. 개별 프로젝트 보기
  async getProject(userId: string, projectNumber: number): Promise<ProjectDetailDto> {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const project = await this.projectRepository.findByIdDetail(projectId);
    if (!project) throw new Error('존재하지 않는 프로젝트입니다.');

    if (!project.isPublic && project.userId !== userId) {
      const error: any = new Error('볼 권한이 없습니다.');
      error.status = 403;
      throw error;
    }
    
    const result = transformProjectToDto(project) 
  
    return result
      
    }

  // 4. 삭제
  async deleteProject(userId: string, projectNumber: number) {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('존재하지 않는 프로젝트입니다.');
    if (project.userId !== userId) {
      const error: any = new Error('삭제 권한이 없습니다.');
      error.status = 403;
      throw error;
    }

    await this.projectRepository.delete(projectId);
    return true;
  }

  // 5. 기술스택 보기
  async getProjectSkills(userId: string, projectNumber: number) {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const project = await this.projectRepository.findByIdDetail(projectId);
    if (!project) throw new Error('존재하지 않는 프로젝트입니다.');
    if (!project.isPublic && project.userId !== userId) {
      const error: any = new Error('볼 권한이 없습니다.');
      error.status = 403;
      throw error;
    }

    return {
      generalSkills: project.generalSkills,
      customSkills: project.customSkills,
    };
  }

  // 6. 태그 보기
  async getProjectTags(userId: string, projectNumber: number) {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const project = await this.projectRepository.findByIdDetail(projectId);
    if (!project) throw new Error('존재하지 않는 프로젝트입니다.');
    if (!project.isPublic && project.userId !== userId) {
      const error: any = new Error('볼 권한이 없습니다.');
      error.status = 403;
      throw error;
    }

    return project.tags;
  }

  // 7. 프로젝트 목록
  async getProjects(userId: string, query: any) {
    return this.projectRepository.findProjects(userId, query);
  }

  // 9. 좋아요
  async favoriteProject(userId: string, projectNumber: number) {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const favorite = await this.projectRepository.toggleFavorite(userId, projectId, true);
    return favorite ? '프로젝트에 좋아요했습니다.' : '이미 좋아요한 프로젝트입니다.';
  }

  // 10. 좋아요 취소
  async unfavoriteProject(userId: string, projectNumber: number) {

    if (!projectNumber) throw new Error('프로젝트를 찾을 수 없습니다.');
    const projectId = await this.projectRepository.findNumberToID(projectNumber);
    if (!projectId) throw new Error('프로젝트를 찾을 수 없습니다.');
    const favorite = await this.projectRepository.toggleFavorite(userId, projectId, false);
    return favorite ? '프로젝트에 좋아요를 취소했습니다.' : '이미 좋아요가 취소된 프로젝트입니다.';
  }
}


type ProjectWithSkills = Project & {
  generalSkills: (ProjectSkill & {
    skill: {
      name: string;
    };
  })[];
  customSkills: string[];
};

function transformProjectToDto(project: ProjectWithSkills): ProjectDetailDto {
  const {
    generalSkills,
    customSkills,
    projectDesc,
    startDate,
    endDate,
    ...rest
  } = project;

  const generalSkillsNames = generalSkills.map((gs) => gs.skill.name);

  return {
    ...rest,
    projectDesc: projectDesc ?? '',
    startDate: startDate.toISOString(),
    endDate: endDate ? endDate.toISOString() : startDate.toISOString(),
    skill: {
      generalSkills: generalSkillsNames,
      customSkills: customSkills,
    },
  };
}