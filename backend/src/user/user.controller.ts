import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../packages/configs/multer.config';

import { UserService } from './services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserUpdateDto } from './dto/update-user.dto';
import { UserListFilters } from './repositories/users.repository';
import { TenantScope } from '../packages/interfaces/list-filter.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Helper to extract the tenant context from the authenticated request.
   */
  private getScope(req: Request): TenantScope {
    const user: any = req['user'];
    if (!user) {
      // Fallback or explicit throw if no guard is active on this route
      throw new Error('User context missing. Ensure AuthGuard is applied.');
    }
    return {
      companyId: user.companyId,
      isSuperAdmin: user.isSuperAdmin === 1 || user.isSuperAdmin === true,
      userId: user.sub,
      role: user.role,
    };
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('profImg', multerConfig))
  async create(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = await this.userService.create(
      this.getScope(req),
      createUserDto,
      file,
    );
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get('list')
  async findAll(@Req() req: Request, @Query() filters: UserListFilters) {
    const result = await this.userService.findAll(this.getScope(req), filters);

    return {
      success: true,
      message: 'Users fetched successfully',
      data: result?.data,
      pagination: result?.pagination,
    };
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const { userId } = this.getScope(req);

    const user = await this.userService.findById(userId);
    return {
      success: true,
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Get('details/:id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id, this.getScope(req));
    return {
      success: true,
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('profImg', multerConfig))
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UserUpdateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = await this.userService.update(
      id,
      this.getScope(req),
      updateUserDto,
      file,
    );
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete('delete/:id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id, this.getScope(req));
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Put('update-prof-img/:id')
  @UseInterceptors(FileInterceptor('profImg', multerConfig))
  async updateProfImg(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.userService.updateProfImg(
      id,
      this.getScope(req),
      file,
    );
    return {
      success: true,
      message: 'Profile image updated successfully',
      data: user,
    };
  }

  @Delete('delete-prof-img/:id')
  async deleteProfImg(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = await this.userService.deleteProfImg(id, this.getScope(req));
    return {
      success: true,
      message: 'Profile image deleted successfully',
      data: user,
    };
  }
}
