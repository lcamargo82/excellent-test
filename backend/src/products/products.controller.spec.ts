import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addImages: jest.fn(),
    removeImage: jest.fn(),
};

describe('ProductsController', () => {
    let controller: ProductsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ProductsController>(ProductsController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateProductDto = {
                name: 'Product',
                price: 5.5,
                createdById: '1',
            };
            mockProductsService.create.mockResolvedValue(dto);

            const mockReq = { user: { userId: '1' } } as any;
            await controller.create(dto, mockReq);

            expect(mockProductsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            mockProductsService.findAll.mockResolvedValue([]);
            const paginationDto = { page: 1, limit: 10 };
            await controller.findAll(paginationDto);
            expect(mockProductsService.findAll).toHaveBeenCalledWith(paginationDto);
        });
    });

    describe('uploadImages', () => {
        it('should upload images', async () => {
            const files = [{ filename: 'test.jpg' }] as any;
            mockProductsService.addImages.mockResolvedValue({ id: 'p1' });

            const result = await controller.uploadImages('p1', files);

            expect(mockProductsService.addImages).toHaveBeenCalledWith('p1', ['/uploads/products/test.jpg']);
            expect(result.message).toContain('1 images uploaded');
        });

        it('should return message if no files', async () => {
            const result = await controller.uploadImages('p1', []);
            expect(result.message).toBe('No files uploaded');
        });
    });

    describe('removeImage', () => {
        it('should remove image', async () => {
            await controller.removeImage('i1');
            expect(mockProductsService.removeImage).toHaveBeenCalledWith('i1');
        });
    });
});
