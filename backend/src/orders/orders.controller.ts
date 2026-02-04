import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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
    findAll(@Query() paginationDto: PaginationDto) {
        return this.ordersService.findAll(paginationDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an order by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOne(id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete an order (Admin only)' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.remove(id);
    }
}
