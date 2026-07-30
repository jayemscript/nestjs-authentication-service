import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Application } from 'src/modules/app-context/entities/application.entity';

@Entity('user_applications')
@Index(['userId', 'appId'], { unique: true })
export class UserApplication {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'app_id', type: 'varchar', length: 100 })
  appId!: string;

  @ManyToOne(
    () => User,
    (user) => user.userApplications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id', referencedColumnName: 'appId' })
  application?: Application;
}
