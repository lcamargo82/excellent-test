import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Client } from '@clients/entities/client.entity';
import { Product } from '@products/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem, Client, Product])],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
