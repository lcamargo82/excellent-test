import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Client } from '@clients/entities/client.entity';
import { Product } from '@products/entities/product.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockOrderRepository = { find: jest.fn(), findOne: jest.fn(), remove: jest.fn() };
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
        it('should create an order successfully', async () => {
            const createDto = {
                clientId: 'client-id',
                items: [{ productId: 'prod-1', quantity: 2 }],
            };

            const mockClient = { id: 'client-id' };
            const mockProduct = { id: 'prod-1', price: 10, stock: 5 };
            const mockManager = {
                findOne: jest.fn().mockImplementation((entity, options) => {
                    if (entity === Client) return Promise.resolve(mockClient);
                    if (entity === Product) return Promise.resolve(mockProduct);
                    return null;
                }),
                save: jest.fn().mockImplementation((entityOrObject) => Promise.resolve(entityOrObject)),
            };

            mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));

            const result = await service.create(createDto);

            expect(mockManager.findOne).toHaveBeenCalledWith(Client, { where: { id: 'client-id' } });
            expect(mockManager.findOne).toHaveBeenCalledWith(Product, { where: { id: 'prod-1' } });
            // Should decrease stock
            expect(mockProduct.stock).toBe(3);
            expect(result).toBeDefined();
        });

        it('should throw error if product has insufficient stock', async () => {
            const createDto = {
                clientId: 'client-id',
                items: [{ productId: 'prod-1', quantity: 10 }],
            };

            const mockClient = { id: 'client-id' };
            const mockProduct = { id: 'prod-1', price: 10, stock: 5 };
            const mockManager = {
                findOne: jest.fn().mockImplementation((entity) => {
                    if (entity === Client) return Promise.resolve(mockClient);
                    if (entity === Product) return Promise.resolve(mockProduct);
                }),
            };

            mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));

            await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
        });
    });
});
