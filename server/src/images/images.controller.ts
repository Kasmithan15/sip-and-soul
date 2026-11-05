import { BadRequestException, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AdminOnly } from '../auth/guards.js';
import { PrismaService } from '../prisma.service.js';

const MAX_BYTES = 3 * 1024 * 1024;

/** Checks the file's real signature, not just the name or the type the browser claims. */
function sniff(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

@Controller()
export class ImagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('admin/images')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES, files: 1 } }))
  async upload(@UploadedFile() file?: { buffer: Buffer; size: number }) {
    if (!file) throw new BadRequestException('Choose a photo to upload (JPG, PNG or WebP, up to 3 MB).');
    const mimeType = sniff(file.buffer);
    if (!mimeType) throw new BadRequestException('Only JPG, PNG or WebP photos can be uploaded.');
    const image = await this.prisma.image.create({ data: { mimeType, data: new Uint8Array(file.buffer) }, select: { id: true } });
    return { url: `/api/images/${image.id}` };
  }

  @Get('images/:id')
  async serve(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found.');
    res.set({ 'Content-Type': image.mimeType, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
    res.send(Buffer.from(image.data));
  }
}
