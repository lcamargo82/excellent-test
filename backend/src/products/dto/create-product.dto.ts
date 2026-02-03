import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Amazing Product' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'This is a great product' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 99.99 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 'uuid-user-id', description: 'ID of the admin who created this product' })
    @IsUUID()
    @IsNotEmpty()
    createdById: string;
}
