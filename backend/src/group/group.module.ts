import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { GroupController } from './group.controller';
import { GroupService } from './service/group.service';
import { GroupListService } from './service/group.list.sevice';
import { GeneralUtilities } from '../packages/utilities/general.utility';
import { GroupsRepository } from './repositories/groups.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  controllers: [GroupController],
  providers: [GroupService, GroupListService, GeneralUtilities, GroupsRepository],
  exports: [GroupService, GroupListService, GroupsRepository],
})
export class GroupModule {}
