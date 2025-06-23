import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.emotion.createMany({
    data: [
      { id: 1, emotion: 'happy', colorCode: '#FFF2C1' },
      { id: 2, emotion: 'sad', colorCode: '#CADBFF' },
      { id: 4, emotion: 'angry', colorCode: '#FFD3D3' },
      { id: 8, emotion: 'anxious', colorCode: '#CBCBFF' },
      { id: 16, emotion: 'calm', colorCode: '#E3F4E4' },
      { id: 32, emotion: 'normal', colorCode: '#B0BEC5' },
      { id: 64, emotion: 'love', colorCode: '#FFDFA9' },
    ],
    skipDuplicates: true // 이미 존재하는 값은 무시
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
