import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/entities/user.entity';

@Entity('clients')
export class Client {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'Client Name' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ example: 'client@example.com' })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @ApiProperty({ example: '+1234567890' })
    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;

    @ApiProperty({ type: () => User })
    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by: User;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deleted_at: Date;
}
