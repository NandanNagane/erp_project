import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GeneralUtilities {
  applyDynamicFilters(queryBuilder: any, filters: any, alias: string) {
    try {
      if (!Array.isArray(filters)) {
        console.log('Filters is not an array:', filters);
        return queryBuilder;
      }

      filters.forEach((filter, index) => {
        let { key, operator, value } = filter;
        console.log('hello');
        if (value === undefined || value === null || value === '') return;

        const paramKey = `${key}_${index}`;

        switch (operator) {
          case 'equal':
            queryBuilder.andWhere(`${alias}.${key} = :${paramKey}`, {
              [paramKey]: value,
            });
            break;

          case 'not_equal':
            queryBuilder.andWhere(`${alias}.${key} != :${paramKey}`, {
              [paramKey]: value,
            });
            break;

          case 'gt':
            queryBuilder.andWhere(`${alias}.${key} > :${paramKey}`, {
              [paramKey]: value,
            });
            break;

          case 'gte':
            queryBuilder.andWhere(`${alias}.${key} >= :${paramKey}`, {
              [paramKey]: value,
            });
            break;

          case 'lt':
            queryBuilder.andWhere(`${alias}.${key} < :${paramKey}`, {
              [paramKey]: value,
            });
            break;

          case 'lte':
            queryBuilder.andWhere(`${alias}.${key} <= :${paramKey}`, {
              [paramKey]: value,
            });
            break;

          case 'like':
            queryBuilder.andWhere(`${alias}.${key} LIKE :${paramKey}`, {
              [paramKey]: `%${value}%`,
            });
            break;

          case 'in':
            queryBuilder.andWhere(`${alias}.${key} IN (:...${paramKey})`, {
              [paramKey]: value,
            });
            break;

          case 'is_null':
            queryBuilder.andWhere(`${alias}.${key} IS NULL`);
            break;

          case 'is_not_null':
            queryBuilder.andWhere(`${alias}.${key} IS NOT NULL`);
            break;

          default:
            console.log(`Wrong  operator: ${operator}`);
        }
      });

      return queryBuilder;
    } catch (err) {
      console.log('Filter error:', err);
      throw err;
    }
  }

  async moveFile(
    file: Express.Multer.File,
    insertId: number,
    folderName: string,
  ): Promise<{ fileName: string; filePath: string }> {
    try {
      if (!file || (!file.originalname && !file.filename)) {
        throw new Error('Invalid file object received');
      }
      console.log('Moving file:', file);
      const originalName = file.originalname;
      const fileName = file.filename;
      const ext = path.extname(originalName);

      // const fileName = `${Date.now()}-${Math.random()
      //   .toString(36)
      //   .substring(2)}${ext}`;

      const targetFolder = path.join(
        process.cwd(),
        'uploads',
        folderName,
        String(insertId),
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
  async finishSuccess(res) {
    let output: any = {
      settings: {
        success: 1,
        data: res,
      },
    };
    return output;
  }
  async finishFailure(res) {
    let output: any = {
      settings: {
        success: 0,
        data: res,
      },
    };
    return output;
  }
}
