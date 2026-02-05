import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = 10;
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = createUserDto;
        const user = this.usersRepository.create({
            ...rest,
            password_hash: passwordHash,
        });
        return this.usersRepository.save(user);
    }

    async findAll(paginationDto: PaginationDto = { page: 1, limit: 10 }): Promise<{ data: User[], total: number, page: number, lastPage: number }> {
        const { page = 1, limit = 10, search } = paginationDto;

        let findOptions: any = {
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' }
        };

        if (search) {
            findOptions.where = [
                { name: ILike(`%${search}%`) },
                { email: ILike(`%${search}%`) }
            ];
        }

        const [data, total] = await this.usersRepository.findAndCount(findOptions);
        const lastPage = Math.ceil(total / limit);

        return { data, total, page, lastPage };
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
