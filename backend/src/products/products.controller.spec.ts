import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
        }).compile();

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
});
