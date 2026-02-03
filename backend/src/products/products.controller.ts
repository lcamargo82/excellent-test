import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ParseUUIDPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create product (Admin only)' })
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
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete a product (Admin only)' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }



    @Post(':id/images')
    @UseGuards(RolesGuard)
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
}
