import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from '@users/entities/user.entity';
import { UsersModule } from '@users/users.module';
// import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'postgres'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'admin'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'admin'),
        database: configService.get<string>('POSTGRES_DB', 'excellent_db'),
        entities: [User], // We will add User entity here
        synchronize: false, // Using migrations
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]), // Register User repository
    UsersModule,
    // OrdersModule,
    AuthModule,
    ClientsModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
