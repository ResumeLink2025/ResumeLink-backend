import { Request, Response } from "express";
import { resumeService } from "../services/resume.service";

export const resumeController = {
  create: async (req: Request, res: Response) => {
    try {
      const { userId } = req.user!;
      const resume = await resumeService.createResumeWithAI(userId, req.body);
      res.status(201).json(resume);
    } catch (error) {
      console.error("이력서 생성 실패:", error);
      res.status(500).json({ message: "이력서 생성 중 오류 발생" });
    }
  },

  getAllByUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.user!;
      const resumes = await resumeService.getResumesByUserId(userId);
      res.json(resumes);
    } catch (error) {
      console.error("이력서 목록 조회 실패:", error);
      res.status(500).json({ message: "이력서 목록 조회 중 오류 발생" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const resume = await resumeService.getResumeById(id);
      res.json(resume);
    } catch (error) {
      console.error("이력서 조회 실패:", error);
      res.status(404).json({ message: "이력서를 찾을 수 없습니다." });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const updated = await resumeService.updateResume(id, userId, req.body);
      res.json(updated);
    } catch (error: unknown) {
      console.error("이력서 수정 실패:", error);
      let message = "이력서 수정 중 오류 발생";
      if (error instanceof Error) {
        if (error.message === "프로필이 존재하지 않습니다." || error.message.includes("권한")) {
          message = error.message;
        }
      }
      res.status(403).json({ message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      await resumeService.deleteResume(id, userId);
      res.status(200).json({ message: "삭제됐습니다" });
    } catch (error: unknown) {
      console.error("이력서 삭제 실패:", error);
      let message = "이력서 삭제 중 오류 발생";
      if (error instanceof Error) {
        if (error.message === "프로필이 존재하지 않습니다." || error.message.includes("권한")) {
          message = error.message;
        }
      }
      res.status(403).json({ message });
    }
  },

  getAllPublic: async (req: Request, res: Response) => {
    try {
      const resumes = await resumeService.getAllResumes();
      res.json(resumes);
    } catch (error) {
      console.error("이력서 목록 조회 실패:", error);
      res.status(500).json({ message: "이력서 목록 조회 중 오류 발생" });
    }
  },

  getPublicResumesByTitleSearch: async (req: Request, res: Response) => {
    try {
      const { searchTerm, skillNames, positionNames } = req.query;

      const skillArray = typeof skillNames === "string" && skillNames.trim() !== ""
        ? skillNames.split(",").map(s => s.trim())
        : undefined;

      const positionArray = typeof positionNames === "string" && positionNames.trim() !== ""
        ? positionNames.split(",").map(s => s.trim())
        : undefined;

      const resumes = await resumeService.getPublicResumesByTitleSearch(
        typeof searchTerm === "string" && searchTerm.trim() !== "" ? searchTerm : undefined,
        skillArray,
        positionArray
      );

      res.json(resumes);
    } catch (error) {
      console.error("제목 검색 이력서 조회 실패:", error);
      res.status(500).json({ message: "이력서 검색 중 오류 발생" });
    }
  },

};
