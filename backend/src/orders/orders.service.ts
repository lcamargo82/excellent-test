import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Client } from '@clients/entities/client.entity';
import { Product } from '@products/entities/product.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private dataSource: DataSource,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        return this.dataSource.transaction(async (manager) => {
            const client = await manager.findOne(Client, {
                where: { id: createOrderDto.clientId },
            });

            if (!client) {
                throw new NotFoundException(`Client with ID ${createOrderDto.clientId} not found`);
            }

            const order = new Order();
            order.client = client;
            order.items = [];
            order.total = 0;

            for (const itemDto of createOrderDto.items) {
                const product = await manager.findOne(Product, {
                    where: { id: itemDto.productId },
                });

                if (!product) {
                    throw new NotFoundException(
                        `Product with ID ${itemDto.productId} not found`,
                    );
                }

                if (product.stock < itemDto.quantity) {
                    throw new BadRequestException(
                        `Product ${product.name} has insufficient stock. Requested: ${itemDto.quantity}, Available: ${product.stock}`,
                    );
                }

                // Deduct stock
                product.stock -= itemDto.quantity;
                await manager.save(product);

                const orderItem = new OrderItem();
                orderItem.product = product;
                orderItem.quantity = itemDto.quantity;
                orderItem.price = product.price;

                order.items.push(orderItem);
                order.total += Number(product.price) * itemDto.quantity;
            }

            return await manager.save(Order, order);
        });
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: ['client', 'items', 'items.product', 'client.created_by'],
        });
    }

    async findOne(id: string): Promise<Order | null> {
        return this.ordersRepository.findOne({
            where: { id },
            relations: ['client', 'items', 'items.product'],
        });
    }

    async remove(id: string): Promise<void> {
        // Here we could implement stock return logic if needed, but per requirements simple delete logic is requested (or not specified yet).
        // Since it's a delete, ideally we should soft-delete the order, but keeping it simple as requested without soft-delete column on order unless I add it.
        // Wait, I added created_by/update/deleted_at to Order entity? No, only created/update.
        // Let's implement hard delete or updated entity.
        // I will implement a check.
        const order = await this.findOne(id);
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        await this.ordersRepository.remove(order);
    }
}
