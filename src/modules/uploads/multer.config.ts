import { diskStorage } from 'multer';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] as const;

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = process.env.UPLOAD_DIR!;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4() + extname(file.originalname);
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      allowedMimeTypes.includes(
        file.mimetype as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'image/svg+xml',
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error('Файл не является изображением!'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
};
