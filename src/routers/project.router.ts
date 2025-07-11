import express, { Request, Response, Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middlewares/middleware.auth';
import { validateDto } from '../middlewares/middleware.dto';
import { CreateProjectDto, UpdateProjectDto } from '../dtos/project.dto';

const router = Router();
const projectController = new ProjectController();

// 프로젝트 생성
router.post(
  '/',
  authMiddleware,
  validateDto(CreateProjectDto),
  async (req: Request, res: Response) => {
    await projectController.createProject(req, res);
  }
);

// 프로젝트 수정
router.put(
  '/:id',
  authMiddleware,
  validateDto(UpdateProjectDto),
  async (req: Request, res: Response) => {
    await projectController.updateProject(req, res);
  }
);

// 개별 프로젝트 보기
router.get(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.getProject(req, res);
  }
);

// 프로젝트 삭제
router.delete(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.deleteProject(req, res);
  }
);

// 프로젝트 기술스택 보기
router.get(
  '/:id/skills',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.getProjectSkills(req, res);
  }
);

// 프로젝트 태그 보기
router.get(
  '/:id/tags',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.getProjectTags(req, res);
  }
);

// 프로젝트 목록
// router.get(
//   '/',
//   authMiddleware,
//   async (req: Request, res: Response) => {
//     await projectController.getProjects(req, res);
//   }
// );

// 내 프로젝트 목록
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.getMyProjects(req, res);
  }
);

// 프로젝트 좋아요
router.post(
  '/:id/favorite',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.favoriteProject(req, res);
  }
);

// 프로젝트 좋아요 취소
router.delete(
  '/:id/favorite',
  authMiddleware,
  async (req: Request, res: Response) => {
    await projectController.unfavoriteProject(req, res);
  }
);

export default router;