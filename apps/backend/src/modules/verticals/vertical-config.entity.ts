import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserVertical } from '../../common/enums/user.enums';

@Entity('vertical_configs')
export class VerticalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserVertical, unique: true })
  vertical: UserVertical;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { default: [] })
  values: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('company_values')
export class CompanyValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}