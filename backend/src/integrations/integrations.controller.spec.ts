import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsController } from './integrations.controller';
import { CnpjService } from './cnpj.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('IntegrationsController', () => {
    let controller: IntegrationsController;
    let cnpjService: CnpjService;

    const mockCnpjService = {
        consultCnpj: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IntegrationsController],
            providers: [
                {
                    provide: CnpjService,
                    useValue: mockCnpjService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<IntegrationsController>(IntegrationsController);
        cnpjService = module.get<CnpjService>(CnpjService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('consultCnpj', () => {
        it('should call CnpjService.consultCnpj', async () => {
            const cnpj = '00000000000191';
            const mockResult = { razao_social: 'TESTE' };

            mockCnpjService.consultCnpj.mockResolvedValue(mockResult);

            const result = await controller.consultCnpj(cnpj);

            expect(result).toEqual(mockResult);
            expect(cnpjService.consultCnpj).toHaveBeenCalledWith(cnpj);
        });
    });
});
