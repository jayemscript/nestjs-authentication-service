import { Column, Entity, OneToMany } from 'typeorm';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { BaseEntity } from 'src/common/entities/base-entity';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { UserApplication } from './user-application.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'email', type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ name: 'password', type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions?: Session[];

  @OneToMany(
    () => UserApplication,
    (userApplication) => userApplication.user,
  )
  userApplications?: UserApplication[];
}
