import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedProjectSkills() {
  await prisma.projectSkill.createMany({
    data: [
      // projectId, skillId는 실제 DB에 맞게 변경 필요
      {
        projectId: "b42617d6-b332-4068-9030-a49a72f0b98c",  // ex) 실제 project.id
        skillId: 1                  // ex) 실제 skill.id
      },
      {
        projectId: "b42617d6-b332-4068-9030-a49a72f0b98c",
        skillId: 2
      },
      {
        projectId: "ca647b57-b973-4163-9fb4-413e40d68936",
        skillId: 3
      }
    ],
    skipDuplicates: true,
  });

  console.log('✅ ProjectSkill seed completed.');
}
