export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password?: string;
    role?: string;
}
