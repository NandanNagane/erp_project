import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index, PrimaryColumn, } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';

@Entity({ name: 'refresh_sessions' })

export class RefreshSessionEntity {
    @PrimaryColumn("uuid")
    id: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId: number;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ type: 'varchar', length: 255 })
    tokenHash: string;

    @Column({ type: 'datetime', nullable: true })
    expiresAt: Date | null;

    @Column({ type: 'datetime', nullable: true })
    revokedAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @Column({ name: "replaced_by", type: "uuid", nullable: true })
    replacedBy: string | null;

}