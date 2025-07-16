// routes/image.ts
import express from 'express';
import upload from '../middlewares/middleware.image'; // multer-s3 미들웨어
import { uploadImage } from '../controllers/image.controller';

const router = express.Router();

router.post('/', upload.single('image'), uploadImage);

export default router;