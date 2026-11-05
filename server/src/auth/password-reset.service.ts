import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma.service.js';

const LINK_LIFETIME_MS = 60 * 60 * 1000;          // a reset link works for 1 hour
const REQUEST_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // unanswered requests disappear after a week

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a "forgot password" request. The answer never reveals whether the email is registered.
   * With an email provider configured the link is emailed straight away; otherwise the request
   * waits in the admin panel, where the admin creates the link and sends it by WhatsApp.
   */
  async request(email: string, origin: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'customer' || user.blocked) return;

    // One request per 10 minutes per customer, so the form can't be used to spam anyone.
    const recent = await this.prisma.passwordReset.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
      select: { id: true },
    });
    if (recent) return;

    if (emailConfigured()) {
      const { url } = await this.createLink(user.id, origin, true);
      await sendResetEmail(user.email, user.name, url).catch((e: unknown) => this.logger.error(`Reset email for user ${user.id} failed: ${String(e)}`));
      return;
    }
    await this.prisma.passwordReset.create({ data: { userId: user.id } });
  }

  async pending() {
    const rows = await this.prisma.passwordReset.findMany({
      where: { tokenHash: null, createdAt: { gt: new Date(Date.now() - REQUEST_LIFETIME_MS) } },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    return rows.map((r) => ({ id: r.id, createdAt: r.createdAt, customer: r.user }));
  }

  /** Creates a one-time link. The raw token is only returned here and never stored. */
  async createLink(userId: string, origin: string, emailed = false) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || user.role !== 'customer') throw new NotFoundException('Customer not found.');
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + LINK_LIFETIME_MS);
    await this.prisma.$transaction([
      // A new link replaces older links and clears the customer's waiting requests.
      this.prisma.passwordReset.deleteMany({ where: { userId } }),
      this.prisma.passwordReset.create({ data: { userId, tokenHash: hashToken(token), expiresAt, emailed } }),
    ]);
    return { url: `${origin.replace(/\/$/, '')}/#/reset-password?token=${token}`, expiresAt };
  }

  async dismiss(id: string) {
    await this.prisma.passwordReset.deleteMany({ where: { id, tokenHash: null } });
  }

  async reset(token: string, password: string) {
    const row = await this.prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!row || !row.expiresAt || row.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This reset link is invalid or has expired. Please request a new one.');
    }
    await this.prisma.$transaction([
      // passwordChangedAt signs out every session opened before the reset.
      this.prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hash(password, 12), passwordChangedAt: new Date() } }),
      this.prisma.passwordReset.deleteMany({ where: { userId: row.userId } }),
    ]);
  }
}

async function sendResetEmail(to: string, name: string, url: string) {
  const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Reset your Sip & Soul Café password',
      html: `<p>Hi ${esc(name)},</p><p>Click the link below to choose a new password. It works once and expires in 1 hour.</p><p><a href="${esc(url)}">Reset my password</a></p><p>If you didn't ask for this, you can ignore this email.</p><p>Sip &amp; Soul Café</p>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}
