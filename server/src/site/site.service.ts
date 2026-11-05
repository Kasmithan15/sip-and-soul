import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { siteDefaults, type SiteContent } from './site.defaults.js';
import type { SiteContentDto } from './site.dto.js';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SiteContent> {
    const row = await this.prisma.siteContent.findUnique({ where: { key: 'website' } });
    // Merge over the defaults so newly added fields always have a value.
    const saved = (row?.data ?? {}) as Partial<SiteContent>;
    return { ...siteDefaults, ...saved, hero: { ...siteDefaults.hero, ...saved.hero }, contact: { ...siteDefaults.contact, ...saved.contact } };
  }

  async save(input: SiteContentDto) {
    const data = JSON.parse(JSON.stringify(input));
    await this.prisma.siteContent.upsert({ where: { key: 'website' }, create: { key: 'website', data }, update: { data } });
    return this.get();
  }
}
