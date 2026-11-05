import { PrismaClient } from '@prisma/client';
import { defaultProducts } from '../src/site/site.defaults.js';

// Adds the original four drinks the first time only, so admin edits are never overwritten.
const prisma = new PrismaClient();
try {
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({ data: defaultProducts });
    console.log(`Seeded ${defaultProducts.length} menu items.`);
  } else {
    console.log('Menu already has items, nothing to seed.');
  }
} finally {
  await prisma.$disconnect();
}
