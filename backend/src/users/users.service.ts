import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...userData } = createUserDto;
        const password_hash = await bcrypt.hash(password, 10);

        const user = this.usersRepository.create({
            ...userData,
            password_hash,
        });

        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'password_hash', 'role', 'name'] });
    }

    async updateRole(id: string, role: string, adminUser: User): Promise<User> {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        user.role = role;
        user.updated_by_user = adminUser;
        return this.usersRepository.save(user);
    }
}
