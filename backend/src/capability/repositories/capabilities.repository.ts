import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CapabilityEntity } from '../entities/capability.entity';

@Injectable()
export class CapabilitiesRepository {
  constructor(
    @InjectRepository(CapabilityEntity)
    private readonly repo: Repository<CapabilityEntity>,
  ) {}

  /**
   * Get all active capabilities.
   * Capabilities are global, not tenant-scoped.
   */
  async findAllActive(): Promise<CapabilityEntity[]> {
    return this.repo.find({
      where: { status: 1 },
      order: { module: 'ASC', displayName: 'ASC' },
    });
  }

  /** Find capability by code (e.g. 'users.read'). */
  async findOneByCode(code: string): Promise<CapabilityEntity | null> {
    return this.repo.findOne({ where: { code } });
  }

  /** Find multiple capabilities by their codes. */
  async findByCodes(codes: string[]): Promise<CapabilityEntity[]> {
    if (!codes.length) return [];
    
    return this.repo
      .createQueryBuilder('cap')
      .where('cap.code IN (:...codes)', { codes })
      .getMany();
  }
}
