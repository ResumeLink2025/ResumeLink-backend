import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dtos/project.dto';
import { plainToInstance } from 'class-transformer';

export class ProjectController {
  private projectService = new ProjectService();

  // 프로젝트 생성
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const input = req.body as CreateProjectDto;
      const createdProject = await this.projectService.createProject(userId, input);

      return res.status(201).json({
        message: '프로젝트 생성 성공',
        data: createdProject,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || '프로젝트 생성 실패' });
    }
  }

  // 프로젝트 수정
  async updateProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const projectNumber = parseInt(req.params.id);
      const input = req.body as UpdateProjectDto;

      const updated = await this.projectService.updateProject(userId, projectNumber, input);

      return res.status(200).json({
        message: '프로젝트 수정 성공',
        data: updated,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || '프로젝트 수정 실패' });
    }
  }

  // 단일 프로젝트 조회
  async getProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const projectNumber = parseInt(req.params.id);

      const project = await this.projectService.getProject(userId, projectNumber);

      return res.status(200).json(project);
    } catch (error: any) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }
  

  // 삭제
  async deleteProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string; 
      const projectNumber = parseInt(req.params.id);

      await this.projectService.deleteProject(userId, projectNumber);

      return res.status(200).json({ message: '프로젝트 삭제 성공' });
    } catch (error: any) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }

  // 기술 스택
  async getProjectSkills(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const projectNumber = parseInt(req.params.id);

      const skills = await this.projectService.getProjectSkills(userId, projectNumber);

      return res.status(200).json({ data: skills });
    } catch (error: any) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }

  // 태그
  async getProjectTags(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const projectNumber = parseInt(req.params.id);

      const tags = await this.projectService.getProjectTags(userId, projectNumber);

      return res.status(200).json({ data: tags });
    } catch (error: any) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }             

  // 전체 목록
  async getProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const query = req.query;

      const skills = Array.isArray(req.query.skillNames)
      ? []
      : typeof req.query.skillNames === 'string'
        ? req.query.skillNames.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const myQuery = {
        ...query,
        desc: query.searchTerm,
        skill: skills,
      };


      const projects = await this.projectService.getProjects(userId, myQuery);

      return res.status(200).json(projects);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // 내 전체 목록
  async getMyProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const query = req.query;

      const myQuery = {
        ...query,
        ownerId: userId,
      };

      const projects = await this.projectService.getProjects(userId, myQuery);

      return res.status(200).json(projects);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }


  

  // 좋아요
  async favoriteProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const projectNumber = parseInt(req.params.id);

      const result = await this.projectService.favoriteProject(userId, projectNumber);

      return res.status(200).json({ message: result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // 좋아요 취소
  async unfavoriteProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId as string;
      const projectNumber = parseInt(req.params.id);

      const result = await this.projectService.unfavoriteProject(userId, projectNumber);

      return res.status(200).json({ message: result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

