import { Request, Response } from 'express';
import deleteImageFromS3 from '../utils/deleteImage'; // S3에서 파일 삭제 유틸리티 함수

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
      return;
    }
    const file = req.file as Express.MulterS3.File;
    const fileUrl = file.location;
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

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: '삭제할 파일 키가 필요합니다.' });
    }

    await deleteImageFromS3(key);

    res.json({ success: true, message: '파일이 삭제되었습니다.' });
  } catch (error) {
    console.error('파일 삭제 중 오류:', error);
    res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
  }
};