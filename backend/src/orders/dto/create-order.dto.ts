import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';

export class OrderItemDto {
    @ApiProperty({ example: 'uuid-product-id' })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'uuid-client-id' })
    @IsUUID()
    @IsNotEmpty()
    clientId: string;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
