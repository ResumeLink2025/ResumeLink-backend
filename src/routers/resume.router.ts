import { Router } from "express";
import { resumeController } from "../controllers/resume.controller";
import { authMiddleware } from "../middlewares/middleware.auth";

const router = Router();

router.get("/search", resumeController.getPublicResumesByTitleSearch);
router.get("/all", resumeController.getAllPublic);
router.post("/", authMiddleware, resumeController.create);
router.get("/", authMiddleware, resumeController.getAllByUser);
router.get("/:id", authMiddleware, resumeController.getById);
router.patch("/:id",authMiddleware, resumeController.update);
router.delete("/:id", authMiddleware, resumeController.delete);
router.post("/:id/favorite", authMiddleware, resumeController.toggleFavorite);

export default router;
