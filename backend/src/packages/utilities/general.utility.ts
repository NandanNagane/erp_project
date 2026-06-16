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



}
