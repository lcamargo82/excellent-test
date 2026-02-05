import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

const mockProductsRepository = {
    create: jest.fn(),
    save: jest.fn(),
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
    findOne: jest.fn(), // Fix: mock findOne explicitly
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
        it('should create a product', async () => {
            const dto = { name: 'P', price: 10, createdById: 'u1' };
            const user = { id: 'u1' };
            mockUsersRepository.findOneBy.mockResolvedValue(user);
            mockProductsRepository.create.mockReturnValue(dto);
            mockProductsRepository.save.mockResolvedValue(dto);

            await service.create(dto);
            expect(mockProductsRepository.save).toHaveBeenCalled();
        });

        it('should throw if user not found', async () => {
            mockUsersRepository.findOneBy.mockResolvedValue(null);
            await expect(service.create({ createdById: 'u1' } as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update product', async () => {
            const product = { id: 'p1', name: 'Old' };
            const dto: UpdateProductDto = { name: 'New' };
            mockProductsRepository.findOne.mockResolvedValue(product);
            mockProductsRepository.save.mockResolvedValue({ ...product, ...dto });

            const result = await service.update('p1', dto);
            expect(result.name).toBe('New');
        });

        it('should throw if product not found', async () => {
            mockProductsRepository.findOne.mockResolvedValue(null);
            await expect(service.update('p1', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete product', async () => {
            mockProductsRepository.softDelete.mockResolvedValue({ affected: 1 });
            await expect(service.remove('p1')).resolves.not.toThrow();
        });

        it('should throw if product not found', async () => {
            mockProductsRepository.softDelete.mockResolvedValue({ affected: 0 });
            await expect(service.remove('p1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('addImages', () => {
        it('should add images to product', async () => {
            const product = { id: 'p1', images: [] };
            mockProductsRepository.findOne.mockResolvedValue(product);
            mockImagesRepository.create.mockReturnValue({});
            mockImagesRepository.save.mockResolvedValue({});

            await service.addImages('p1', ['url1', 'url2']);

            expect(mockImagesRepository.create).toHaveBeenCalledTimes(2);
            expect(mockImagesRepository.save).toHaveBeenCalledTimes(1);
        });

        it('should throw if product not found', async () => {
            mockProductsRepository.findOne.mockResolvedValue(null);
            await expect(service.addImages('p1', [])).rejects.toThrow(NotFoundException);
        });
    });

    describe('removeImage', () => {
        it('should remove image', async () => {
            mockImagesRepository.findOneBy.mockResolvedValue({ id: 'i1' });
            mockImagesRepository.delete.mockResolvedValue({ affected: 1 });
            await expect(service.removeImage('i1')).resolves.not.toThrow();
        });

        it('should throw if image not found', async () => {
            mockImagesRepository.findOneBy.mockResolvedValue(null);
            await expect(service.removeImage('i1')).rejects.toThrow(NotFoundException);
        });
    });
});
