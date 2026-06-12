import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './user/entities/user.entity';
import { UserGroupEntity } from './user/entities/user-group.entity';
import { GroupEntity } from './group/entities/group.entity';
import { CompanyEntity } from './company/entities/company.entity';
import { CapabilityEntity } from './capability/entities/capability.entity';
import { GroupCapabilityEntity } from './capability/entities/group-capability.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'erp',

  entities: [
    CompanyEntity,
    UserEntity,
    GroupEntity,
    CapabilityEntity,
    GroupCapabilityEntity,
    UserGroupEntity,
  ],

  synchronize: true,
  // logging: true,
};
