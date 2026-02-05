import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should hash password and save user', async () => {
            const createUserDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };
            const hashedPassword = 'hashedPassword';
            const savedUser = { ...createUserDto, id: '1', password_hash: hashedPassword } as any;

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            mockUserRepository.create.mockReturnValue(savedUser);
            mockUserRepository.save.mockResolvedValue(savedUser);

            const result = await service.create(createUserDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                name: createUserDto.name,
                email: createUserDto.email,
                password_hash: hashedPassword,
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);
            expect(result).toEqual(savedUser);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [{ id: '1', name: 'Test User' }] as User[];
            mockUserRepository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(mockUserRepository.find).toHaveBeenCalled();
            expect(result).toEqual(users);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            const user = { id: '1', name: 'Test User' } as User;
            mockUserRepository.findOneBy.mockResolvedValue(user);

            const result = await service.findOne('1');

            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
            expect(result).toEqual(user);
        });

        it('should return null if user not found', async () => {
            mockUserRepository.findOneBy.mockResolvedValue(null);
            expect(await service.findOne('999')).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('should return user by email', async () => {
            const user = { id: '1', email: 'test@test.com' };
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.findByEmail('test@test.com');
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
                select: ['id', 'email', 'password_hash', 'role', 'name']
            });
            expect(result).toEqual(user);
        });
    });

    describe('updateRole', () => {
        it('should update user role', async () => {
            const user = { id: '1', role: 'USER' };
            const admin = { id: 'admin' } as User;
            mockUserRepository.findOneBy.mockResolvedValue(user);
            mockUserRepository.save.mockResolvedValue({ ...user, role: 'ADMIN' });

            const result = await service.updateRole('1', 'ADMIN', admin);
            expect(result.role).toBe('ADMIN');
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw if user not found', async () => {
            mockUserRepository.findOneBy.mockResolvedValue(null);
            await expect(service.updateRole('1', 'A', {} as any)).rejects.toThrow();
        });
    });
});
