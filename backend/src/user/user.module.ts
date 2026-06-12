import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserGroupEntity } from './entities/user-group.entity';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { UserListService } from './services/user.list.service';
import { GeneralUtilities } from '../packages/utilities/general.utility';
import { UsersRepository } from './repositories/users.repository';
import { UserGroupsRepository } from './repositories/user-groups.repository';
import { UserDetailsService } from './services/user.details.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserGroupEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    UserListService,
    GeneralUtilities,
    UserDetailsService,
    UsersRepository,
    UserGroupsRepository,
  ],
  exports: [UserService, UsersRepository, UserGroupsRepository],
})
export class UserModule {}
