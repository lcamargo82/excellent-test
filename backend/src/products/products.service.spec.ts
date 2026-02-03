import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { User } from '@users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockProductsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
};

const mockUsersRepository = {
    findOneBy: jest.fn(),
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
                    createdById: 'invalid',
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return products array', async () => {
            const products = [{ id: '1', name: 'Product' }];
            mockProductsRepository.find.mockResolvedValue(products);

            const result = await service.findAll();

            expect(mockProductsRepository.find).toHaveBeenCalledWith({ relations: ['created_by'] });
            expect(result).toEqual(products);
        });
    });
});
