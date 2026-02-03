import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @ApiOperation({ summary: 'Create client' })
    @ApiResponse({ status: 201, description: 'The client has been successfully created.' })
    create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all clients' })
    findAll() {
        return this.clientsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a client by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.clientsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a client' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(id, updateClientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a client' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.clientsService.remove(id);
    }
}
