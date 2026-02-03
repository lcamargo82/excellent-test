import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt';
import { User } from "../users/entities/user.entity"; // Adjust path if needed

require('dotenv').config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: 5432,
    username: process.env.DB_USER || 'excellent_user',
    password: process.env.DB_PASSWORD || 'excellent_pass',
    database: process.env.DB_NAME || 'excellent_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
});

async function run() {
    await dataSource.initialize();
    console.log("Database connected.");

    const repo = dataSource.getRepository(User);
    const email = 'admin@excellent.com';
    const user = await repo.findOne({ where: { email } });

    if (user) {
        const newPass = 'admin123';
        const hash = await bcrypt.hash(newPass, 10);
        user.password_hash = hash;
        await repo.save(user);
        console.log(`Password for ${email} reset to: ${newPass}`);
    } else {
        console.log(`User ${email} not found.`);
        // Create if missing?
        const newPass = 'admin123';
        const hash = await bcrypt.hash(newPass, 10);
        // ... (Simplified: assume exists based on migration)
    }

    await dataSource.destroy();
}

run().catch(err => console.error(err));
