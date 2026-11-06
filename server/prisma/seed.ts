import { PrismaClient } from '@prisma/client';
import { defaultProducts } from '../src/site/site.defaults.js';

// Adds the starter drinks once, on the first start of a new database. A marker row records that it ran,
// so drinks an admin deletes later are never added back.
const prisma = new PrismaClient();
try {
  const marker = await prisma.siteContent.findUnique({ where: { key: 'seeded' } });
  if (marker) {
    console.log('Starter menu already added earlier, nothing to do.');
  } else {
    const existing = new Set((await prisma.product.findMany({ select: { name: true } })).map((p) => p.name));
    const missing = defaultProducts.filter((p) => !existing.has(p.name));
    if (missing.length) await prisma.product.createMany({ data: missing });
    await prisma.siteContent.create({ data: { key: 'seeded', data: { at: new Date().toISOString() } } });
    console.log(`Added ${missing.length} starter drinks.`);
  }
} finally {
  await prisma.$disconnect();
}
