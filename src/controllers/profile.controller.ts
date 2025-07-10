import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: '인증 정보가 없습니다.' });
    return;
  }

  const {
    nickname,
    birthday,
    gender,
    customSkill,
    customInterest,
    customPosition,
    experienceYears,
    employmentStatus,
    imageUrl,
    summary,
    userSkills = [],
    desirePositions = [],
  } = req.body;

  try {
    const profile = await profileService.updateUserProfile(
      userId,
      {
        nickname,
        birthday,
        gender,
        customSkill,
        customInterest,
        customPosition,
        experienceYears,
        employmentStatus,
        imageUrl,
        summary,
      },
      userSkills,
      desirePositions
    );

    res.status(200).json({ message: '프로필 업데이트 성공', profile });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: '인증 정보가 없습니다.' });
    return;
  }

  try {
    const profile = await profileService.getUserProfile(userId);

    if (!profile) {
      res.status(404).json({ message: '추가 프로필 정보가 존재하지 않습니다.' });
      return;
    }

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};