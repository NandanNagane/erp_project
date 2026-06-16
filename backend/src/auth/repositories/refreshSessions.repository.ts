import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';

import { RefreshSessionEntity } from '../entities/refreshSessions.entity';

@Injectable()
export class RefreshSessionsRepository {
  constructor(
    @InjectRepository(RefreshSessionEntity)
    private readonly repo: Repository<RefreshSessionEntity>,
  ) {}

  /** Create and persist a new refresh session */
  async create(
    data: Partial<RefreshSessionEntity>,
  ): Promise<RefreshSessionEntity> {
    const entity = this.repo.create(data);

    return this.repo.save(entity);
  }

  /** Find an active session by ID (not revoked and not expired) */
  async findActiveById(id: string): Promise<RefreshSessionEntity | null> {
    const qb = this.repo
      .createQueryBuilder('session')
      .where('session.id = :id', { id })
      .andWhere('session.revokedAt IS NULL')
      .andWhere('(session.expiresAt IS NULL OR session.expiresAt > :now)', {
        now: new Date(),
      });

    return qb.getOne();
  }

  async findActiveByIdAndHash(
    id: string,
    tokenHash: string,
  ): Promise<RefreshSessionEntity | null> {
    const qb = this.repo
      .createQueryBuilder('session')
      .where('session.id = :id', { id })
      .andWhere('session.tokenHash = :tokenHash', { tokenHash })
      .andWhere('session.revokedAt IS NULL')
      .andWhere('(session.expiresAt IS NULL OR session.expiresAt > :now)', {
        now: new Date(),
      });

    return qb.getOne();
  }

  /** Revoke all active sessions for a given user (revoke family) */
  async revokeFamily(userId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(RefreshSessionEntity)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }

  /** Revoke a single active session by ID */
  async revokeOne(id: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(RefreshSessionEntity)
      .set({ revokedAt: new Date() })
      .where('id = :id', { id })
      .andWhere('revokedAt IS NULL')
      .execute();
  }

  async revokeById(id: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(RefreshSessionEntity)
      .set({ revokedAt: new Date() })
      .where('id = :id', { id })
      .andWhere('revokedAt IS NULL')
      .execute();
  }

  /**
   * Rotate a session: mark old as revoked, point replacedBy to new, and create new session
   */
  async rotate(
    oldId: string,
    newSessionData: Partial<RefreshSessionEntity>,
  ): Promise<RefreshSessionEntity> {
    return this.repo.manager.transaction(async (manager) => {
      // Create new session first to get its ID if it was auto-generated,
      // but typically we pass a pre-generated UUID in newSessionData.
      const newEntity = manager.create(RefreshSessionEntity, newSessionData);
      const savedNew = await manager.save(newEntity);

      // Mark old session as revoked and set replacedBy
      await manager.update(
        RefreshSessionEntity,
        { id: oldId },
        {
          revokedAt: new Date(),
          replacedBy: savedNew.id,
        },
      );

      return savedNew;
    });
  }
}
