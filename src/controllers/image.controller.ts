import { Request, Response } from 'express';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.MulterS3.File | undefined;
    const fileUrl = file?.location;
    if (!fileUrl) {
      res.status(400).json({ error: '파일 업로드 실패' });
      return;
    }
    res.json({ success: true, imageUrl: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류' });
  }
};

