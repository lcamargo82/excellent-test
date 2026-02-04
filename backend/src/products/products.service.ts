import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(ProductImage)
        private imagesRepository: Repository<ProductImage>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { createdById, ...productData } = createProductDto;

        const user = await this.usersRepository.findOneBy({ id: createdById });
        if (!user) {
            throw new NotFoundException(`User with ID ${createdById} not found`);
        }

        const product = this.productsRepository.create({
            ...productData,
            stock: productData.stock || 0,
            created_by: user,
        });

        return this.productsRepository.save(product);
    }

    async findAll(paginationDto: PaginationDto): Promise<{ data: Product[], total: number, page: number, lastPage: number }> {
        const { page = 1, limit = 10 } = paginationDto;
        const [data, total] = await this.productsRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['created_by', 'images'],
        });

        const lastPage = Math.ceil(total / limit);

        return { data, total, page, lastPage };
    }

    async findOne(id: string): Promise<Product | null> {
        return this.productsRepository.findOne({
            where: { id },
            relations: ['created_by', 'images'],
        });
    }

    async addImages(id: string, urls: string[]): Promise<Product> {
        const product = await this.findOne(id);
        if (!product) throw new NotFoundException('Product not found');

        const images = urls.map(url => this.imagesRepository.create({ url, product }));
        await this.imagesRepository.save(images);

        const updatedProduct = await this.findOne(id);
        if (!updatedProduct) throw new NotFoundException('Product not found after adding images');
        return updatedProduct;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const { createdById, ...updateData } = updateProductDto;

        if (createdById) {
            const user = await this.usersRepository.findOneBy({ id: createdById });
            if (!user) {
                throw new NotFoundException(`User with ID ${createdById} not found`);
            }
            product.created_by = user;
        }

        Object.assign(product, updateData);
        return this.productsRepository.save(product);
    }

    async removeImage(imageId: string): Promise<void> {
        const image = await this.imagesRepository.findOneBy({ id: imageId });
        if (!image) {
            throw new NotFoundException(`Image with ID ${imageId} not found`);
        }
        await this.imagesRepository.delete(imageId);
    }

    async remove(id: string): Promise<void> {
        const result = await this.productsRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
    }
}
