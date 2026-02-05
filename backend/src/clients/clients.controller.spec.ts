import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('ClientsController', () => {
    let controller: ClientsController;
    let service: ClientsService;

    const mockClientsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        findByEmail: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientsController],
            providers: [
                {
                    provide: ClientsService,
                    useValue: mockClientsService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ClientsController>(ClientsController);
        service = module.get<ClientsService>(ClientsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a client', async () => {
            const dto: CreateClientDto = { name: 'Test', document: '123', email: 'test@test.com' };
            const req = { user: { userId: 'user-id' } };

            mockClientsService.create.mockResolvedValue(dto);

            expect(await controller.create(dto, req as any)).toEqual(dto);
            expect(service.create).toHaveBeenCalledWith({ ...dto, createdById: 'user-id' });
        });
    });

    describe('findAll', () => {
        it('should return all clients', async () => {
            const result = { data: [], total: 0 };
            mockClientsService.findAll.mockResolvedValue(result);

            expect(await controller.findAll({})).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('should return one client', async () => {
            const result = { id: 'uuid' };
            mockClientsService.findOne.mockResolvedValue(result);

            expect(await controller.findOne('uuid')).toEqual(result);
        });
    });

    describe('update', () => {
        it('should update a client', async () => {
            const result = { id: 'uuid' };
            mockClientsService.update.mockResolvedValue(result);

            expect(await controller.update('uuid', {})).toEqual(result);
        });
    });

    describe('remove', () => {
        it('should remove a client', async () => {
            mockClientsService.remove.mockResolvedValue(undefined);
            await expect(controller.remove('uuid')).resolves.not.toThrow();
        });
    });
});
