import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, ParseUUIDPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create product (Admin only)' })
    @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
    create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
        createProductDto.createdById = (req.user as any).userId;
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all products' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productsService.findAll(paginationDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update a product (Admin only)' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete a product (Admin only)' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }

    @Post(':id/images')
    @Roles('ADMIN')
    @UseInterceptors(FilesInterceptor('files', 5, {
        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    @ApiOperation({ summary: 'Upload product images (Admin only)' })
    async uploadImages(@Param('id', ParseUUIDPipe) id: string, @UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            return { message: 'No files uploaded' };
        }

        const urls = files.map(file => `/uploads/products/${file.filename}`);
        const product = await this.productsService.addImages(id, urls);

        return {
            message: `${urls.length} images uploaded successfully`,
            product
        };
    }

    @Delete('images/:imageId')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Remove a product image (Admin only)' })
    async removeImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
        await this.productsService.removeImage(imageId);
        return { message: 'Image removed successfully' };
    }
}
