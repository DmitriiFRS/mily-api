/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PrismaService } from 'src/core/prisma.service';
import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { Prisma } from 'generated/prisma/client';

export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async processAndUploadFile(
    file: Express.Multer.File,
    tx?: Prisma.TransactionClient,
  ) {
    if (file.mimetype === 'image/svg+xml') {
      await this.sanitizeSvgOnDisk(file.path);
    }
    return this.saveToDatabase(file, tx);
  }

  async processAndUploadFiles(
    files: Express.Multer.File[],
    tx?: Prisma.TransactionClient,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не предоставлены');
    }
    const uploadPromises = files.map((file) =>
      this.processAndUploadFile(file, tx),
    );
    return Promise.all(uploadPromises);
  }

  private async sanitizeSvgOnDisk(filePath: string): Promise<void> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      const sanitizedString = purify.sanitize(fileContent);
      await fs.promises.writeFile(filePath, sanitizedString, 'utf-8');
    } catch {
      await fs.promises.unlink(filePath).catch(() => {});
      throw new BadRequestException('Ошибка при обработке SVG файла');
    }
  }

  private async saveToDatabase(
    file: Express.Multer.File,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx || this.prisma;
    try {
      const relativePath = `/uploads/${file.filename}`;
      return await db.file.create({
        data: {
          path: relativePath,
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    } catch {
      await fs.promises.unlink(file.path).catch(() => {});
      throw new BadRequestException(
        'Ошибка при сохранении файла в базу данных',
      );
    }
  }

  public sanitizeSvg(buffer: Buffer): Buffer {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const svgString = buffer.toString('utf-8');
    const sanitizedString = purify.sanitize(svgString);
    return Buffer.from(sanitizedString, 'utf-8');
  }

  async deleteFile(fileId: number, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma;
    try {
      await db.file.update({
        where: { id: fileId },
        data: { isOrphaned: true },
      });
    } catch (error) {
      console.error(`Ошибка при пометке файла ${fileId} на удаление:`, error);
    }
  }
}
