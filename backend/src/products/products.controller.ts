import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Create product' })
    @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all products' })
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }
}
