import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClientDto {
    @ApiProperty({ example: 'John Doe Client' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'client@test.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '5511999999999' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'uuid-user-id', description: 'ID of the admin who created this client' })
    @IsUUID()
    @IsNotEmpty()
    createdById: string;
}
