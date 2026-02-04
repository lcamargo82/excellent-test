export interface Client {
    id: string;
    name: string;
    email: string;
    document: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    lastPage: number;
    limit: number;
}
