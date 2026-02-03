import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create order' })
    @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all orders' })
    findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an order by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an order' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.remove(id);
    }
}
