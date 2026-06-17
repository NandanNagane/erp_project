import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entities/user.entity';
import { GeneralUtilities } from '../../packages/utilities/general.utility';
import {
  UsersRepository,
  UserListFilters,
} from '../repositories/users.repository';
import { UserGroupsRepository } from '../repositories/user-groups.repository';
import {
  TenantScope,
  PaginatedResult,
} from '../../packages/interfaces/list-filter.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserUpdateDto } from '../dto/update-user.dto';
import { FileStorageService } from '../../packages/service/file-storage.service';
import { Role } from 'src/packages/role.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly userGroupsRepo: UserGroupsRepository,
    private readonly general: GeneralUtilities,
    private readonly fileStorageService: FileStorageService,
  ) { }

  // ───────────────────────── CRUD Operations ─────────────────────────

  async create(
    scope: TenantScope,
    dto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
    if (await this.usersRepo.existsByEmail(dto.email)) {
      throw new ConflictException('Email already in use');
    }
    if (await this.usersRepo.existsByUsername(dto.username)) {
      throw new ConflictException('Username already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersRepo.createAndSave({
      name: dto.name,
      username: dto.username,
      email: dto.email,
      passwordHash,
      companyId:
        scope.isSuperAdmin && dto.companyId ? dto.companyId : scope.companyId,
      role: scope.isSuperAdmin ? dto.role : Role.COMPANY_EMPLOYEE,
      phone: dto.phone,
      dob: dto.dob ? new Date(dto.dob) : null,
      createdBy: scope.userId,
    });

    if (dto.groupId) {
      await this.userGroupsRepo.assignGroupToUser(
        user.id,
        dto.groupId,
        scope.userId,
      );
    }

    if (file) {
      const { fileName } = await this.fileStorageService.moveFile(
        file,
        'users',
      );
      await this.usersRepo.updateByIdAndCompany(user.id, scope, {
        profImg: fileName,
      });
      user.profImg = fileName;
    }

    return user;
  }

  async findAll(
    scope: TenantScope,
    filters: UserListFilters,
  ): Promise<PaginatedResult<UserEntity>> {

    console.log("control reached in findAll")

    return this.usersRepo.findAllByCompany(scope, filters);
  }

  async findOne(id: number, scope: TenantScope): Promise<UserEntity> {
    const user = await this.usersRepo.findWithGroupAndCompany(id, scope);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(
    id: number,
    scope: TenantScope,
    dto: UserUpdateDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
    if (dto.email) {
      const existingEmail = await this.usersRepo.findOneByEmail(dto.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }
    if (dto.username) {
      const existingUsername = await this.usersRepo.findOneByUsername(
        dto.username,
      );
      if (existingUsername && existingUsername.id !== id) {
        throw new ConflictException('Username already in use');
      }
    }

    const updateData: any = { ...dto };
    delete updateData.groupId; // Handled separately

    if (dto.dob) {
      updateData.dob = new Date(dto.dob);
    }
    if (scope.isSuperAdmin && dto.companyId) {
      updateData.companyId = dto.companyId;
    } else {
      delete updateData.companyId;
    }

    const user = await this.usersRepo.updateByIdAndCompany(
      id,
      scope,
      updateData,
    );
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.groupId !== undefined) {
      await this.userGroupsRepo.replaceUserGroup(id, dto.groupId, scope.userId);
    }

    const updatedUser = await this.findOne(id, scope);

    if (file) {
      if (updatedUser.profImg) {
        await this.fileStorageService.deleteFile(updatedUser.profImg, 'users');
      }
      const { fileName } = await this.fileStorageService.moveFile(
        file,
        'users',
      );
      await this.usersRepo.updateByIdAndCompany(id, scope, {
        profImg: fileName,
      });
      updatedUser.profImg = fileName;
    }

    return updatedUser;
  }

  async remove(id: number, scope: TenantScope): Promise<void> {
    const user = await this.findOne(id, scope);
    const deleted = await this.usersRepo.softDeleteByIdAndCompany(id, scope);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.profImg) {
      await this.fileStorageService.deleteFile(user.profImg, 'users');
    }
  }

  async updateProfImg(
    id: number,
    scope: TenantScope,
    file: Express.Multer.File,
  ): Promise<UserEntity> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const user = await this.findOne(id, scope);

    if (user.profImg) {
      await this.fileStorageService.deleteFile(user.profImg, 'users');
    }

    const { fileName } = await this.fileStorageService.moveFile(file, 'users');
    await this.usersRepo.updateByIdAndCompany(id, scope, { profImg: fileName });

    user.profImg = fileName;
    return user;
  }

  async deleteProfImg(id: number, scope: TenantScope): Promise<UserEntity> {
    const user = await this.findOne(id, scope);

    if (user.profImg) {
      await this.fileStorageService.deleteFile(user.profImg, 'users');
      await this.usersRepo.updateByIdAndCompany(id, scope, { profImg: null });
      user.profImg = null;
    }

    return user;
  }

  // ───────────────────────── Auth / Legacy Methods ─────────────────────────

  async findOneByUsername(username: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOneByUsername(username);
    return user || undefined;
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOneById(id);
    return user || undefined;
  }
}
