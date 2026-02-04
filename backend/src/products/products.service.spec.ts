import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { User } from '@users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockProductsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
};

const mockUsersRepository = {
    findOneBy: jest.fn(),
};

const mockImagesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
};

describe('ProductsService', () => {
    let service: ProductsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductsRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
                {
                    provide: getRepositoryToken(ProductImage),
                    useValue: mockImagesRepository,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a product linked to a user', async () => {
            const createDto = {
                name: 'Product',
                price: 10.5,
                stock: 0,
                createdById: 'userId',
            };
            const user = { id: 'userId' } as User;
            const newProduct = { ...createDto, created_by: user } as any;

            mockUsersRepository.findOneBy.mockResolvedValue(user);
            mockProductsRepository.create.mockReturnValue(newProduct);
            mockProductsRepository.save.mockResolvedValue(newProduct);

            const result = await service.create(createDto);

            expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: 'userId' });
            expect(mockProductsRepository.create).toHaveBeenCalledWith({
                name: 'Product',
                price: 10.5,
                stock: 0,
                created_by: user,
            });
            expect(result).toEqual(newProduct);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUsersRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.create({
                    name: 'Product',
                    price: 10,
                    stock: 0,
                    createdById: 'invalid',
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated products', async () => {
            const products = [{ id: '1', name: 'Product' }];
            const total = 1;
            mockProductsRepository.findAndCount.mockResolvedValue([products, total]);

            const paginationDto = { page: 1, limit: 10 };
            const result = await service.findAll(paginationDto);

            expect(mockProductsRepository.findAndCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                relations: ['created_by', 'images'],
            });
            expect(result).toEqual({ data: products, total, page: 1, lastPage: 1 });
        });
    });
});
