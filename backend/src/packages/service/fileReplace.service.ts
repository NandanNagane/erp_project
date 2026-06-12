import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  async replaceFile(oldFileName: string, newFile: Express.Multer.File) {
    const uploadPath = './uploads';
    const oldFilePath = path.join(uploadPath, oldFileName);

    try {
      await fs.access(oldFilePath);
      await fs.unlink(oldFilePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
    return newFile.filename;
  }
}
