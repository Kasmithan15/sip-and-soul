import { BadRequestException, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AdminOnly } from '../auth/guards.js';
import { PrismaService } from '../prisma.service.js';
import { sniffImage } from './sniff.js';

const MAX_BYTES = 3 * 1024 * 1024;

@Controller()
export class ImagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('admin/images')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES, files: 1 } }))
  async upload(@UploadedFile() file?: { buffer: Buffer; size: number }) {
    if (!file) throw new BadRequestException('Choose a photo to upload (JPG, PNG or WebP, up to 3 MB).');
    const mimeType = sniffImage(file.buffer);
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
