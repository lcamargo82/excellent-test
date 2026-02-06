import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Return all users.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user role (Admin only)' })
    updateRole(@Param('id') id: string, @Body('role') role: string, @Request() req) {
        return this.usersService.updateRole(id, role, req.user);
    }
}
