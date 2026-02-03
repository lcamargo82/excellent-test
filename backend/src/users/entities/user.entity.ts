import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'John Doe' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ example: 'john@example.com' })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, select: false })
    password_hash: string;

    // Security columns
    @ApiProperty({ nullable: true })
    @Column({ type: 'varchar', length: 45, nullable: true })
    ip_address: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reset_token: string;

    @Column({ type: 'timestamp', nullable: true })
    reset_token_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    last_password_change: Date;

    // Audit columns
    @ApiProperty()
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deleted_at: Date;
}
