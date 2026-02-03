import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedData1770151700000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get Admin User ID for created_by
        const user = await queryRunner.query(`SELECT id FROM "users" LIMIT 1`);
        const userId = user[0]?.id;

        if (userId) {
            // Seed Clients
            await queryRunner.query(`
                INSERT INTO "clients" ("name", "email", "phone", "created_by") VALUES
                ('Empresa Alpha', 'contato@alpha.com', '+5511999991111', '${userId}'),
                ('Beta Soluções', 'comercial@beta.com', '+5511988882222', '${userId}'),
                ('Gamma Tech', 'finan@gamma.com', '+5511977773333', '${userId}');
            `);

            // Seed Products
            await queryRunner.query(`
                INSERT INTO "products" ("name", "description", "price", "stock", "created_by") VALUES
                ('Notebook Gamer', 'Notebook alta performance i7 16GB', 5500.00, 10, '${userId}'),
                ('Monitor 4K', 'Monitor 27 polegadas UHD 4K', 2100.00, 25, '${userId}'),
                ('Teclado Mecânico', 'Teclado switch blue RGB', 350.00, 50, '${userId}');
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove Seeding
        await queryRunner.query(`DELETE FROM "products" WHERE "name" IN ('Notebook Gamer', 'Monitor 4K', 'Teclado Mecânico')`);
        await queryRunner.query(`DELETE FROM "clients" WHERE "email" IN ('contato@alpha.com', 'comercial@beta.com', 'finan@gamma.com')`);
    }

}
