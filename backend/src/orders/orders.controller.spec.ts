import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
};

describe('OrdersController', () => {
    let controller: OrdersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [{ provide: OrdersService, useValue: mockOrdersService }],
        }).compile();

        controller = module.get<OrdersController>(OrdersController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto = { clientId: 'c1', items: [] };
            await controller.create(dto);
            expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const paginationDto = { page: 1, limit: 10 };
            const req = { user: { id: 'test', role: 'ADMIN' } };
            await controller.findAll(paginationDto, req);
            expect(mockOrdersService.findAll).toHaveBeenCalledWith(paginationDto, req.user);
        });
    });
});
