import { Router } from "express";
import { resumeController } from "../controllers/resume.controller";
import { authMiddleware } from "../middlewares/middleware.auth";

const router = Router();

// 이력서 생성 (AI 기반 생성)
router.post(
  "/",
  authMiddleware,
  resumeController.create
);

// 이력서 목록 조회 (사용자별)
router.get("/", authMiddleware, resumeController.getAllByUser);

// 이력서 단일 조회
router.get("/:id", authMiddleware, resumeController.getById);

// 이력서 수정
router.patch(
  "/:id",
  authMiddleware,
  resumeController.update
);

// 이력서 삭제
router.delete("/:id", authMiddleware, resumeController.delete);


export default router;
