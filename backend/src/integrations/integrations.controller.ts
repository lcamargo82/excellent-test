import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CnpjService } from './cnpj.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly cnpjService: CnpjService) { }

    @Get('cnpj/:cnpj')
    @ApiOperation({ summary: 'Consult CNPJ Data' })
    consultCnpj(@Param('cnpj') cnpj: string) {
        return this.cnpjService.consultCnpj(cnpj);
    }
}
