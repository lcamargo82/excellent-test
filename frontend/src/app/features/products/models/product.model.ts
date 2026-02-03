export interface ProductImage {
    id: string;
    url: string;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: ProductImage[];
    created_at: string;
    updated_at: string;
}
