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

@Entity('products')
export class Product {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'Product Name' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ example: 'Product Description' })
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({ example: 99.99 })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

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
