import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createClientDto: CreateClientDto): Promise<Client> {
        const { createdById, ...clientData } = createClientDto;

        const user = await this.usersRepository.findOneBy({ id: createdById });
        if (!user) {
            throw new NotFoundException(`User with ID ${createdById} not found`);
        }

        const client = this.clientsRepository.create({
            ...clientData,
            created_by: user,
        });

        return this.clientsRepository.save(client);
    }

    async findAll(paginationDto: PaginationDto): Promise<{ data: Client[], total: number, page: number, limit: number }> {
        const { page = 1, limit = 10 } = paginationDto;
        const [data, total] = await this.clientsRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['created_by'], // Added relations here to maintain previous behavior
        });
        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Client | null> {
        return this.clientsRepository.findOne({
            where: { id },
            relations: ['created_by'],
        });
    }

    async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
        const client = await this.findOne(id);
        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        const { createdById, ...updateData } = updateClientDto;

        if (createdById) {
            const user = await this.usersRepository.findOneBy({ id: createdById });
            if (!user) {
                throw new NotFoundException(`User with ID ${createdById} not found`);
            }
            client.created_by = user;
        }

        Object.assign(client, updateData);
        return this.clientsRepository.save(client);
    }

    async remove(id: string): Promise<void> {
        const result = await this.clientsRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }
    }
}
