import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function seedPositions() {
  await prisma.position.createMany({
    data: [
    {
        "name": "프론트엔드 개발자"
    },
    {
        "name": "백엔드 개발자"
    },
    {
        "name": "풀스택 개발자"
    },
    {
        "name": "웹 개발자"
    },
    {
        "name": "모바일 앱 개발자"
    },
    {
        "name": "iOS 개발자"
    },
    {
        "name": "안드로이드 개발자"
    },
    {
        "name": "임베디드 개발자"
    },
    {
        "name": "게임 개발자"
    },
    {
        "name": "AI 엔지니어"
    },
    {
        "name": "데이터 엔지니어"
    },
    {
        "name": "데이터 사이언티스트"
    },
    {
        "name": "머신러닝 엔지니어"
    },
    {
        "name": "딥러닝 엔지니어"
    },
    {
        "name": "DevOps 엔지니어"
    },
    {
        "name": "Site Reliability Engineer"
    },
    {
        "name": "클라우드 엔지니어"
    },
    {
        "name": "보안 엔지니어"
    },
    {
        "name": "QA 엔지니어"
    },
    {
        "name": "테스트 자동화 엔지니어"
    },
    {
        "name": "소프트웨어 엔지니어"
    },
    {
        "name": "시스템 엔지니어"
    },
    {
        "name": "네트워크 엔지니어"
    },
    {
        "name": "DBA (데이터베이스 관리자)"
    },
    {
        "name": "크로스플랫폼 앱 개발자"
    },
    {
        "name": "VR/AR 개발자"
    },
    {
        "name": "로보틱스 엔지니어"
    },
    {
        "name": "블록체인 개발자"
    },
    {
        "name": "스크럼 마스터"
    },
    {
        "name": "기술 리드"
    }
],
    skipDuplicates: true
  });

  console.log('✅ Position seed completed.');
}