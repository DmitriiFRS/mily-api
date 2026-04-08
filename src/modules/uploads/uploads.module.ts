/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { PrismaService } from 'src/core/prisma.service';
import { UploadsService } from './uploads.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uploadPath = configService.get<string>('UPLOAD_DIR')!;
        return {
          storage: diskStorage({
            destination: (req, file, cb) => {
              if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
              }
              cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
              const uniqueFileName = `${uuidv4()}${extname(file.originalname)}`;
              cb(null, uniqueFileName);
            },
          }),
          limits: { fileSize: 30 * 1024 * 1024 },
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, PrismaService],
  exports: [UploadsService],
})
export class UploadsModule {}
