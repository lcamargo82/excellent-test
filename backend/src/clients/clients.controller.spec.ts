import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('ClientsController', () => {
    let controller: ClientsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientsController],
            providers: [
                {
                    provide: ClientsService,
                    useValue: mockClientsService,
                },
            ],
        }).compile();

        controller = module.get<ClientsController>(ClientsController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateClientDto = {
                name: 'Client',
                email: 'c@t.com',
                document: '12345678000195',
                createdById: '1',
            };
            mockClientsService.create.mockResolvedValue(dto);

            const mockReq = { user: { userId: '1' } } as any;
            await controller.create(dto, mockReq);

            expect(mockClientsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            mockClientsService.findAll.mockResolvedValue([]);
            const paginationDto = { page: 1, limit: 10 };
            await controller.findAll(paginationDto);
            expect(mockClientsService.findAll).toHaveBeenCalledWith(paginationDto);
        });
    });
});
