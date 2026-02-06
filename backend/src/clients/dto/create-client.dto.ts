import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Validate } from 'class-validator';
import { CnpjValidator } from '../../common/validators/cnpj.validator';

export class CreateClientDto {
    @ApiProperty({ example: 'John Doe Client' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '12345678000195', description: 'CNPJ (14 digits)' })
    @IsString()
    @IsNotEmpty()
    @Validate(CnpjValidator)
    document: string;

    @ApiProperty({ example: 'client@test.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '5511999999999' })
    @IsString()
    @IsOptional()
    phone?: string;

    @IsOptional()
    @IsUUID()
    createdById?: string;
}
