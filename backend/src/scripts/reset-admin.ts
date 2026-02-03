import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt';
import { User } from "../users/entities/user.entity"; // Adjust path if needed

require('dotenv').config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: 5432,
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'excellent_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
});

async function run() {
    await dataSource.initialize();
    console.log("Database connected.");

    const repo = dataSource.getRepository(User);
    const email = 'admin@excellent.com';
    let user = await repo.findOne({ where: { email } });

    if (!user) {
        console.log(`User ${email} not found. Creating...`);
        user = repo.create({
            name: 'Admin User',
            email: email,
            role: 'ADMIN'
        });
    }

    const newPass = 'admin123';
    const hash = await bcrypt.hash(newPass, 10);
    user.password_hash = hash;

    await repo.save(user);
    console.log(`Password for ${email} reset to: ${newPass}`);
    console.log(`Hash starts with: ${hash.substring(0, 10)}...`);

    await dataSource.destroy();
}

run().catch(err => console.error(err));
