import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function seedCategories() {
  await prisma.category.createMany({
    data: [
  { "name": "문제 해결사" },
  { "name": "꼼꼼한 디버거" },
  { "name": "빠른 학습자" },
  { "name": "팀 플레이어" },
  { "name": "리더십 보유자" },
  { "name": "창의적인 사고" },
  { "name": "사용자 중심 사고" },
  { "name": "기술 혁신 추구자" },
  { "name": "성능 최적화 전문가" },
  { "name": "문서화 철저자" },
  { "name": "자동화 애호가" },
  { "name": "오픈소스 참여자" },
  { "name": "지속적 통합/배포 경험자" },
  { "name": "코드 품질 중시" },
  { "name": "테스트 주도 개발자" },
  { "name": "커뮤니케이션 능력 우수" },
  { "name": "자기 주도적 학습자" },
  { "name": "새로운 기술 탐험가" },
  { "name": "보안 의식 강한 개발자" },
  { "name": "유지보수 용이성 중시" }
],
    skipDuplicates: true
  });

  console.log('✅ Category seed completed.');
}