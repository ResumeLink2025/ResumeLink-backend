import { PrismaClient } from '@prisma/client';
import { seedPositions } from "./seed/seed-position";
import { seedSkills } from "./seed/seed-skill";

const prisma = new PrismaClient();

async function main() {
  await seedPositions();
  await seedSkills();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });