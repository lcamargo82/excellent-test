import { Client } from '../../clients/models/client.model';
import { Product } from '../../products/models/product.model';

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    price: number; // Unit price at the time of order
}

export interface Order {
    id: string;
    client: Client;
    items: OrderItem[];
    total: number;
    status: string; // PENDING, COMPLETED, CANCELED
    created_at: string;
}

export interface CreateOrderDto {
    clientId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}
