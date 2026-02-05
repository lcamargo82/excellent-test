import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    const mockConfigService = {
        get: jest.fn().mockReturnValue('secretKey'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should validate and return user payload', async () => {
        const payload = { sub: 1, email: 'test@test.com', role: 'admin' };
        const result = await strategy.validate(payload);
        expect(result).toEqual({ userId: 1, email: 'test@test.com', role: 'admin' });
    });
});
