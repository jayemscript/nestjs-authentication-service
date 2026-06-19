import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base-entity';
import { User } from 'src/modules/users/entities/user.entity';
import { SessionStatus } from 'src/common/enums/session-status.enum';
import { DeviceType } from 'src/common/enums/device-type.enum';
import { Application } from 'src/modules/app-context/entities/application.entity';

@Entity('sessions')
export class Session extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ name: 'app_id', type: 'varchar', length: 100, default: 'legacy' })
  appId!: string;

  @Column({ name: 'device_fingerprint', type: 'varchar', length: 255 })
  deviceFingerprint!: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.DESKTOP,
  })
  deviceType!: DeviceType;

  @Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true })
  deviceName?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text' })
  userAgent!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status!: SessionStatus;

  @Column({ name: 'last_activity_at', type: 'timestamptz', nullable: true })
  lastActivityAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Application, (application) => application.sessions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'app_id', referencedColumnName: 'appId' })
  application?: Application;
}
