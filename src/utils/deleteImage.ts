import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './s3';



async function deleteImageFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key, // 삭제할 파일의 S3 객체 키 (경로)
    });
    await s3Client.send(command);
    console.log(`파일 삭제 성공: ${key}`);
  } catch (error) {
    console.error('S3 파일 삭제 실패', error);
    throw error;
  }
}
export default deleteImageFromS3;