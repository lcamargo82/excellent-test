import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    stock?: number;

    @IsOptional()
    @IsUUID()
    createdById?: string;
}
