import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';

import { GroupService } from './service/group.service';
import { GroupListService } from './service/group.list.sevice';
import { GroupAddDto } from './dto/groupAdd.dto';
import { GroupUpdateDto } from './dto/groupUpdate.dto';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupListService: GroupListService,
  ) {}

  @Post('add')
  async addGroup(@Body() body: GroupAddDto) {
    return await this.groupService.startGroupInsert(body);
  }

  @Put('update')
  async updateGroup(@Body() body: GroupUpdateDto) {
    return await this.groupService.startGroupUpdate(body);
  }
  @Get('all')
  async getAllGroups() {
    return await this.groupListService.getAllGroupsForDropdown();
  }

  @Get('list')
  async getGroupList(@Query() query) {
    return await this.groupListService.startGroupList(query);
  }

  @Get(':id')
  async getOneGroup(@Param('id') id: number) {
    return await this.groupListService.startGroupDetails({ id });
  }

  @Delete('delete/:id')
  async deleteGroup(@Param('id') id: number) {
    return await this.groupService.startGroupDelete(id);
  }
}
