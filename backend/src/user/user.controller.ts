import { Controller, Get, Param, Query } from '@nestjs/common';

import { UserListService } from './services/user.list.service';
import { UserDetailsService } from './services/user.details.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userListService: UserListService,
    private readonly UserDetailsService: UserDetailsService,
  ) {}

  @Get('users-list')
  async getUserList(@Query() query: any) {
    return await this.userListService.startUserList(query);
  }

  @Get('all')
  async getAllUsers(@Query() query: any) {
    return await this.userListService.startGetAllUsers(query);
  }

  @Get('details')
  async getUserDetails(@Query() query: any) {
    return await this.UserDetailsService.startUserDetails(query);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return await this.UserDetailsService.startUserDetails({ id });
  }
}
