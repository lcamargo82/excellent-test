import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CnpjService } from './cnpj.service';
import { IntegrationsController } from './integrations.controller';

@Module({
    imports: [HttpModule],
    controllers: [IntegrationsController],
    providers: [CnpjService],
})
export class IntegrationsModule { }
