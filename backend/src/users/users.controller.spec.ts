import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
};

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create with dto', async () => {
            const dto: CreateUserDto = {
                name: 'Test',
                email: 'test@example.com',
                password: 'password',
            };
            const resultUser = { id: '1', ...dto } as any;

            mockUsersService.create.mockResolvedValue(resultUser);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(resultUser);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [{ id: '1', name: 'Test' }] as User[];
            mockUsersService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(users);
        });
    });
});
