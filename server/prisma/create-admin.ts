import { execFileSync } from 'node:child_process';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

// Creates (or resets) the café admin. On Railway set ADMIN_EMAIL and ADMIN_PASSWORD; locally it asks.
const prompts = createInterface({ input: stdin, output: stdout });
if (!process.env.ADMIN_EMAIL && !stdin.isTTY) {
  prompts.close();
  throw new Error('Run npm run admin:create in a terminal, or set ADMIN_EMAIL and ADMIN_PASSWORD.');
}
const email = (process.env.ADMIN_EMAIL ?? (await prompts.question('Admin email: '))).trim().toLowerCase();
let password = process.env.ADMIN_PASSWORD;
if (!password && stdin.isTTY) {
  stdout.write('Admin password (hidden): ');
  execFileSync('stty', ['-echo'], { stdio: 'inherit' });
  try {
    password = await prompts.question('');
  } finally {
    execFileSync('stty', ['echo'], { stdio: 'inherit' });
    stdout.write('\n');
  }
}
prompts.close();
const name = process.env.ADMIN_NAME?.trim() || 'Sip & Soul Admin';

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || Buffer.byteLength(password) > 72 ||
  !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  throw new Error('Use a valid email and a password of 12 to 72 characters with letters and numbers.');
}

const prisma = new PrismaClient();
try {
  const passwordHash = await hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: 'admin' },
    update: { passwordHash, role: 'admin', blocked: false, passwordChangedAt: new Date() },
  });
  console.log(`Admin account ready for ${email}.`);
} finally {
  await prisma.$disconnect();
}
