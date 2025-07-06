import { PrismaClient } from '@prisma/client';
import { seedPositions } from "./seed/seed-position";
import { seedSkills } from "./seed/seed-skill";
import { seedCategories } from "./seed/seed-category";

const prisma = new PrismaClient();

async function main() {
  await seedPositions();
  await seedSkills();
  await seedCategories();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });