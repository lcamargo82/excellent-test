import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { User } from '../users/entities/user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateClientDto } from './dto/update-client.dto';

describe('ClientsService', () => {
    let service: ClientsService;
    let clientsRepository: Repository<Client>;
    let usersRepository: Repository<User>;

    const mockClientsRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findAndCount: jest.fn(),
        findOne: jest.fn(),
        softDelete: jest.fn(),
    };

    const mockUsersRepository = {
        findOneBy: jest.fn(),
    };

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
        clientsRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a client successfully', async () => {
            const createDto: CreateClientDto = {
                name: 'Cliente Teste',
                document: '12345678000195',
                email: 'client@test.com',
                createdById: 'user-uuid',
            };
            const mockUser = { id: 'user-uuid' } as User;
            const mockClient = { id: 'client-uuid', ...createDto, created_by: mockUser } as Client;

            mockUsersRepository.findOneBy.mockResolvedValue(mockUser);
            mockClientsRepository.create.mockReturnValue(mockClient);
            mockClientsRepository.save.mockResolvedValue(mockClient);

            const result = await service.create(createDto);

            expect(result).toEqual(mockClient);
            expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-uuid' });
            expect(mockClientsRepository.save).toHaveBeenCalledWith(mockClient);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUsersRepository.findOneBy.mockResolvedValue(null);
            const createDto: CreateClientDto = {
                name: 'Cliente Teste',
                document: '12345678000195',
                email: 'client@test.com',
                createdById: 'user-uuid',
            };

            await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated clients', async () => {
            const result = { data: [], total: 0, page: 1, limit: 10 };
            mockClientsRepository.findAndCount.mockResolvedValue([[], 0]);

            expect(await service.findAll({ page: 1, limit: 10 })).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('should return a client by id', async () => {
            const mockClient = { id: 'uuid' } as Client;
            mockClientsRepository.findOne.mockResolvedValue(mockClient);

            expect(await service.findOne('uuid')).toEqual(mockClient);
        });
    });

    describe('update', () => {
        it('should update a client successfully', async () => {
            const updateDto: UpdateClientDto = { name: 'Updated Name' };
            const mockClient = { id: 'uuid', name: 'Old Name' } as Client;

            mockClientsRepository.findOne.mockResolvedValue(mockClient);
            mockClientsRepository.save.mockResolvedValue({ ...mockClient, ...updateDto });

            const result = await service.update('uuid', updateDto);

            expect(result.name).toBe('Updated Name');
        });

        it('should throw NotFoundException if client not found', async () => {
            mockClientsRepository.findOne.mockResolvedValue(null);
            await expect(service.update('uuid', {})).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if new createdBy user not found', async () => {
            const mockClient = { id: 'uuid' } as Client;
            mockClientsRepository.findOne.mockResolvedValue(mockClient);
            mockUsersRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update('uuid', { createdById: 'invalid-user' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a client successfully', async () => {
            mockClientsRepository.softDelete.mockResolvedValue({ affected: 1 });
            await expect(service.remove('uuid')).resolves.not.toThrow();
        });

        it('should throw NotFoundException if client to remove not found', async () => {
            mockClientsRepository.softDelete.mockResolvedValue({ affected: 0 });
            await expect(service.remove('uuid')).rejects.toThrow(NotFoundException);
        });
    });
});
