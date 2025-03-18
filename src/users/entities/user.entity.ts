import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  avatarUrl: string;
}
