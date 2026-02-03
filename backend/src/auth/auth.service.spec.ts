import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUsersService = {
    findByEmail: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(() => 'test-token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user data if validation is successful', async () => {
            const user = { id: '1', email: 'test@test.com', password_hash: 'hashed', role: 'USER' };
            mockUsersService.findByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@test.com', 'pass');
            expect(result).toEqual({ id: '1', email: 'test@test.com', role: 'USER' });
        });

        it('should return null if password does not match', async () => {
            const user = { id: '1', email: 'test@test.com', password_hash: 'hashed', role: 'USER' };
            mockUsersService.findByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser('test@test.com', 'pass');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access token', async () => {
            const user = { id: '1', email: 'test@test.com', role: 'USER' };
            jest.spyOn(service, 'validateUser').mockResolvedValue(user);

            const result = await service.login({ email: 'test@test.com', password: 'pass' });
            expect(result).toEqual({ access_token: 'test-token' });
        });

        it('should throw UnauthorizedException if validation fails', async () => {
            jest.spyOn(service, 'validateUser').mockResolvedValue(null);

            await expect(service.login({ email: 'test@test.com', password: 'pass' })).rejects.toThrow(UnauthorizedException);
        });
    });
});
