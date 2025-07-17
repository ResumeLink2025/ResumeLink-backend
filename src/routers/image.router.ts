import {Router} from 'express';
import upload from '../middlewares/middleware.image'; // multer-s3 미들웨어
import { uploadImage, deleteImage } from '../controllers/image.controller';

const router = Router();

router.post('/', upload.single('image'), uploadImage);
router.delete('/', deleteImage);

export default router;