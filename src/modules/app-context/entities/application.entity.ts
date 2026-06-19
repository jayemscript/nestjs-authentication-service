import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base-entity';
import { ApplicationStatus } from 'src/common/enums/application-status.enum';
import { Session } from 'src/modules/sessions/entities/session.entity';

@Entity('applications')
export class Application extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'app_id', type: 'varchar', length: 100 })
  appId!: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.ACTIVE,
  })
  status!: ApplicationStatus;

  @Column({
    name: 'refresh_token_expiration_seconds',
    type: 'int',
    default: 2592000,
  })
  refreshTokenExpirationSeconds!: number;

  @Column({ name: 'max_sessions_per_user', type: 'int', default: 5 })
  maxSessionsPerUser!: number;

  @Column({ name: 'strict_ip_validation', type: 'boolean', default: false })
  strictIpValidation!: boolean;

  @OneToMany(() => Session, (session) => session.application)
  sessions?: Session[];
}
