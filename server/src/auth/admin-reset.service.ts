import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma.service.js';

const CODE_LIFETIME_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60 * 1000;

/** 077 123 4567 → 94771234567, the form SMS gateways expect for Sri Lankan numbers. */
export const toInternational = (phone: string) => {
  const d = phone.replace(/\D/g, '');
  return d.startsWith('0') ? `94${d.slice(1)}` : d;
};
/** Shows only the last 4 digits, e.g. "••• ••• 7269". */
export const maskPhone = (phone: string) => `••• ••• ${phone.replace(/\D/g, '').slice(-4)}`;

const smsConfigured = () => Boolean(process.env.NOTIFY_USER_ID && process.env.NOTIFY_API_KEY && process.env.NOTIFY_SENDER_ID);

@Injectable()
export class AdminResetService {
  private readonly logger = new Logger(AdminResetService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashCode(userId: string, code: string) {
    // Keyed with the server secret, so a leaked database can't be used to guess codes offline.
    return createHmac('sha256', process.env.JWT_SECRET!).update(`${userId}:${code}`).digest('hex');
  }

  phone() {
    const phone = process.env.ADMIN_RESET_PHONE?.trim();
    if (!phone) throw new ServiceUnavailableException('Admin password reset by phone is not set up yet. Run "npm run admin:create" on the server instead.');
    return phone;
  }

  /** Sends a code when the email is an admin's. The answer is the same either way. */
  async request(email: string) {
    const phone = this.phone();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user?.role === 'admin') {
      const recent = await this.prisma.adminResetCode.findFirst({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_AFTER_MS) } } });
      if (!recent) {
        const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
        await this.prisma.$transaction([
          this.prisma.adminResetCode.deleteMany({ where: { userId: user.id } }),
          this.prisma.adminResetCode.create({ data: { userId: user.id, codeHash: this.hashCode(user.id, code), expiresAt: new Date(Date.now() + CODE_LIFETIME_MS) } }),
        ]);
        await this.send(phone, `Sip & Soul Café admin: your password reset code is ${code}. It expires in 10 minutes. Don't share it with anyone.`);
      }
    }
    return { sentTo: maskPhone(phone) };
  }

  async reset(email: string, code: string, password: string) {
    const invalid = 'The code is incorrect or has expired. Request a new code and try again.';
    const user = await this.prisma.user.findUnique({ where: { email } });
    const row = user?.role === 'admin' ? await this.prisma.adminResetCode.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }) : null;
    if (!user || !row || row.expiresAt.getTime() < Date.now()) throw new BadRequestException({ message: invalid, field: 'code' });
    if (row.attempts >= MAX_ATTEMPTS) throw new BadRequestException({ message: 'Too many wrong codes. Request a new code.', field: 'code' });

    const expected = Buffer.from(row.codeHash, 'hex');
    const given = Buffer.from(this.hashCode(user.id, code), 'hex');
    if (!timingSafeEqual(expected, given)) {
      const attempts = row.attempts + 1;
      await this.prisma.adminResetCode.update({ where: { id: row.id }, data: { attempts } });
      const left = MAX_ATTEMPTS - attempts;
      throw new BadRequestException({ message: left > 0 ? `That code is incorrect. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Request a new code.', field: 'code' });
    }
    await this.prisma.$transaction([
      // passwordChangedAt signs the admin out on every device.
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(password, 12), passwordChangedAt: new Date(), blocked: false } }),
      this.prisma.adminResetCode.deleteMany({ where: { userId: user.id } }),
    ]);
  }

  private async send(phone: string, message: string) {
    if (!smsConfigured()) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('Admin reset code could not be sent: NOTIFY_USER_ID, NOTIFY_API_KEY and NOTIFY_SENDER_ID are not set.');
        throw new ServiceUnavailableException('Text messages are not set up yet, so the code could not be sent.');
      }
      // Local testing without an SMS account: show the code in the server terminal.
      this.logger.warn(`[development] SMS to ${maskPhone(phone)}: ${message}`);
      return;
    }
    // Notify.lk (Sri Lankan SMS gateway): https://developer.notify.lk
    const params = new URLSearchParams({
      user_id: process.env.NOTIFY_USER_ID!,
      api_key: process.env.NOTIFY_API_KEY!,
      sender_id: process.env.NOTIFY_SENDER_ID!,
      to: toInternational(phone),
      message,
    });
    const res = await fetch(`https://app.notify.lk/api/v1/send?${params}`).catch(() => null);
    const body = res ? await res.json().catch(() => null) : null;
    if (!res?.ok || body?.status !== 'success') {
      this.logger.error(`Notify.lk SMS failed: HTTP ${res?.status ?? 'no response'}`);
      throw new ServiceUnavailableException('The text message could not be sent. Please try again in a minute.');
    }
  }
}
