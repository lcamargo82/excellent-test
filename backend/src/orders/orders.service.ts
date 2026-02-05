import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, ILike } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

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

    async findAll(paginationDto: PaginationDto, user?: any): Promise<{ data: Order[], total: number, page: number, lastPage: number }> {
        const { page = 1, limit = 10, search } = paginationDto;

        let findOptions: any = {
            skip: (page - 1) * limit,
            take: limit,
            relations: ['client', 'items', 'items.product', 'client.created_by'],
            order: { created_at: 'DESC' }
        };

        if (search) {
            findOptions.where = [
                // Filter by Client Name
                { client: { name: ILike(`%${search}%`) } },
                { id: ILike(`%${search}%`) }
            ];

            // If user is restricted, we need to enforce that ON TOP of search
            // But TypeORM array 'where' is OR. We need AND (search OR search) AND (user_filter)
            // Easier way: map the array to include the user restriction
            if (user && user.role === 'USER') {
                findOptions.where = findOptions.where.map((condition: any) => ({
                    ...condition,
                    client: {
                        ...(condition.client || {}),
                        created_by: { id: user.id }
                    }
                }));
            }
        } else {
            // Logic without search but WITH potential user restriction
            if (user && user.role === 'USER') {
                findOptions.where = {
                    client: {
                        created_by: { id: user.id }
                    }
                };
            }
        }

        const [data, total] = await this.ordersRepository.findAndCount(findOptions);

        const lastPage = Math.ceil(total / limit);

        return { data, total, page, lastPage };
    }

    async findOne(id: string): Promise<Order | null> {
        return this.ordersRepository.findOne({
            where: { id },
            relations: ['client', 'items', 'items.product'],
        });
    }

    async remove(id: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const order = await manager.findOne(Order, {
                where: { id },
                relations: ['items', 'items.product'],
            });

            if (!order) {
                throw new NotFoundException(`Order with ID ${id} not found`);
            }

            // Restore stock for each product
            for (const item of order.items) {
                if (item.product) {
                    item.product.stock = Number(item.product.stock) + Number(item.quantity);
                    await manager.save(Product, item.product);
                }
            }

            // Delete order (Cascade handles items if configured, but let's be explicit or trust TypeORM cascade)
            // Based on order.entity.ts, items has cascade: true
            await manager.remove(Order, order);
        });
    }
}
