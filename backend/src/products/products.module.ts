import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '@users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, ProductImage, User]),
        AuthModule
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService]
})
export class ProductsModule { }
