import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create client' })
    @ApiResponse({ status: 201, description: 'The client has been successfully created.' })
    create(@Body() createClientDto: CreateClientDto, @Req() req: Request) {
        createClientDto.createdById = (req.user as any).userId;
        return this.clientsService.create(createClientDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user client profile' })
    getMe(@Req() req: Request) {
        const email = (req.user as any).email;
        return this.clientsService.findByEmail(email);
    }

    @Get()
    // @Roles('ADMIN') - Removed to allow Salespeople (USER) to list clients
    @ApiOperation({ summary: 'List all clients' })
    @ApiResponse({ status: 200, description: 'Return all clients.' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.clientsService.findAll(paginationDto);
    }

    @Get(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get a client by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.clientsService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update a client' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(id, updateClientDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete a client' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.clientsService.remove(id);
    }
}
