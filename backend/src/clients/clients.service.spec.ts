import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { User } from '@users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockClientsRepository = {
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

describe('ClientsService', () => {
    let service: ClientsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientsService,
                {
                    provide: getRepositoryToken(Client),
                    useValue: mockClientsRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        service = module.get<ClientsService>(ClientsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a client linked to a user', async () => {
            const createDto = {
                name: 'Client',
                email: 'client@test.com',
                document: '12345678000195',
                createdById: 'userId',
            };
            const user = { id: 'userId' } as User;
            const newClient = { ...createDto, created_by: user } as any;

            mockUsersRepository.findOneBy.mockResolvedValue(user);
            mockClientsRepository.create.mockReturnValue(newClient);
            mockClientsRepository.save.mockResolvedValue(newClient);

            const result = await service.create(createDto);

            expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: 'userId' });
            expect(mockClientsRepository.create).toHaveBeenCalledWith({
                name: 'Client',
                email: 'client@test.com',
                document: '12345678000195',
                created_by: user,
            });
            expect(result).toEqual(newClient);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUsersRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.create({
                    name: 'Client',
                    email: 'test@test.com',
                    document: '12345678000195',
                    createdById: 'invalid',
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated clients', async () => {
            const clients = [{ id: '1', name: 'Client' }];
            const total = 1;
            mockClientsRepository.findAndCount.mockResolvedValue([clients, total]);

            const paginationDto = { page: 1, limit: 10 };
            const result = await service.findAll(paginationDto);

            expect(mockClientsRepository.findAndCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                relations: ['created_by'],
            });
            expect(result).toEqual({ data: clients, total, page: 1, limit: 10 });
        });
    });
});
