import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Client } from '@clients/entities/client.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: () => Client })
    @ManyToOne(() => Client)
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @ApiProperty({ type: () => [OrderItem] })
    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @ApiProperty({ example: 150.0 })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @ApiProperty({ example: 'PENDING' })
    @Column({ type: 'varchar', length: 50, default: 'PENDING' })
    status: string;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
