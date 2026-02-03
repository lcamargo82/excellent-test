import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '@products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
    @ApiProperty({ example: 'uuid-v4' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ApiProperty({ type: () => Product })
    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ApiProperty({ example: 2 })
    @Column({ type: 'int' })
    quantity: number;

    @ApiProperty({ example: 10.5 })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
}
