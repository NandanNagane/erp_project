import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  /**
   * Moves an uploaded file from temp-upload to the specified destination directory.
   * @param file The uploaded file object
   * @param folderName The target subfolder in the static serve path (e.g., 'users' or 'company')
   * @returns The saved file name and path
   */
  async moveFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<{ fileName: string; filePath: string }> {
    try {
      if (!file || (!file.originalname && !file.filename)) {
        throw new Error('Invalid file object received');
      }

      const fileName = file.filename;
      const staticPath = process.env.SERVE_STATIC_PATH || 'public/uploads';

      const targetFolder = path.join(
        process.cwd(),
        staticPath,
        folderName,
      );

      await fs.promises.mkdir(targetFolder, { recursive: true });

      const newFilePath = path.join(targetFolder, fileName);

      if (file.path) {
        await fs.promises.rename(file.path, newFilePath);
      } else if (file.buffer) {
        await fs.promises.writeFile(newFilePath, file.buffer);
      } else {
        throw new Error('File has neither path nor buffer');
      }

      return {
        fileName,
        filePath: newFilePath,
      };
    } catch (err) {
      console.log('File move error:', err);
      throw err;
    }
  }

  /**
   * Deletes a file from the specified destination directory.
   * @param fileName The name of the file to delete
   * @param folderName The subfolder where the file is located (e.g., 'users' or 'company')
   */
  async deleteFile(fileName: string, folderName: string): Promise<void> {
    try {
      if (!fileName) return;

      const staticPath = process.env.SERVE_STATIC_PATH || 'public/uploads';
      const targetFilePath = path.join(
        process.cwd(),
        staticPath,
        folderName,
        fileName,
      );

      const exists = await fs.promises.access(targetFilePath).then(() => true).catch(() => false);
      if (exists) {
        await fs.promises.unlink(targetFilePath);
      }
    } catch (err) {
      console.log('File delete error:', err);
      throw err;
    }
  }
}
