import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockOrderRepository = { find: jest.fn(), findOne: jest.fn(), remove: jest.fn(), findAndCount: jest.fn() };
const mockClientRepository = {};
const mockProductRepository = {};

const mockDataSource = {
    transaction: jest.fn(),
};

describe('OrdersService', () => {
    let service: OrdersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
                { provide: getRepositoryToken(Client), useValue: mockClientRepository },
                { provide: getRepositoryToken(Product), useValue: mockProductRepository },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        let mockManager: any;

        beforeEach(() => {
            mockManager = {
                findOne: jest.fn(),
                save: jest.fn(),
            };
            mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));
        });

        it('should create an order successfully', async () => {
            const createDto = {
                clientId: 'client-id',
                items: [{ productId: 'prod-1', quantity: 2 }],
            };

            const mockClient = { id: 'client-id' };
            const mockProduct = { id: 'prod-1', price: 10, stock: 5 };
            const savedOrder = { id: 'order-id', total: 20 };

            mockManager.findOne.mockImplementation((entity: any) => {
                if (entity === Client) return Promise.resolve(mockClient);
                if (entity === Product) return Promise.resolve(mockProduct);
                return null;
            });
            mockManager.save.mockImplementation((entityOrObject: any, data: any) => {
                if (entityOrObject === Order) return Promise.resolve({ ...data, id: 'order-id' });
                return Promise.resolve(entityOrObject);
            });

            const result = await service.create(createDto);

            expect(mockManager.findOne).toHaveBeenCalledWith(Client, { where: { id: 'client-id' } });
            expect(mockManager.findOne).toHaveBeenCalledWith(Product, { where: { id: 'prod-1' } });
            // Stock should be deducted in memory before save
            expect(mockProduct.stock).toBe(3);
            expect(mockManager.save).toHaveBeenCalledWith(mockProduct);
            expect(result).toEqual(expect.objectContaining({ id: 'order-id' }));
        });

        it('should throw NotFoundException if client not found', async () => {
            const createDto = { clientId: 'client-id', items: [] };
            mockManager.findOne.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if product not found', async () => {
            mockManager.findOne.mockImplementation((entity: any) => {
                if (entity === Client) return Promise.resolve({ id: 'client' });
                return null;
            });

            await expect(service.create({ clientId: 'c', items: [{ productId: 'p', quantity: 1 }] })).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if insufficient stock', async () => {
            const mockProduct = { id: 'prod-1', price: 10, stock: 1 };
            mockManager.findOne.mockImplementation((entity: any) => {
                if (entity === Client) return Promise.resolve({ id: 'client' });
                if (entity === Product) return Promise.resolve(mockProduct);
            });

            await expect(service.create({ clientId: 'c', items: [{ productId: 'p', quantity: 5 }] })).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return paginated orders', async () => {
            const result = { data: [], total: 0, page: 1, lastPage: 0 };
            mockOrderRepository.findAndCount.mockResolvedValue([[], 0]);

            expect(await service.findAll({ page: 1, limit: 10 })).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('should return one order', async () => {
            const order = { id: 'uuid' };
            mockOrderRepository.findOne.mockResolvedValue(order);
            expect(await service.findOne('uuid')).toEqual(order);
        });
    });

    describe('remove', () => {
        let mockManager: any;

        beforeEach(() => {
            mockManager = {
                findOne: jest.fn(),
                save: jest.fn(),
                remove: jest.fn(),
            };
            mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));
        });

        it('should restore stock and remove order', async () => {
            const mockProduct = { id: 'p1', stock: 10 };
            const mockOrder = {
                id: 'o1',
                items: [{ product: mockProduct, quantity: 5 }]
            };

            mockManager.findOne.mockResolvedValue(mockOrder);

            await service.remove('o1');

            expect(mockProduct.stock).toBe(15); // 10 + 5
            expect(mockManager.save).toHaveBeenCalledWith(Product, mockProduct);
            expect(mockManager.remove).toHaveBeenCalledWith(Order, mockOrder);
        });

        it('should throw NotFoundException if order not found', async () => {
            mockManager.findOne.mockResolvedValue(null);
            await expect(service.remove('o1')).rejects.toThrow(NotFoundException);
        });
    });
});
