import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1770145434614 implements MigrationInterface {
    name = 'CreateUsersTable1770145434614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "ip_address" character varying(45), "reset_token" character varying(255), "reset_token_at" TIMESTAMP, "last_password_change" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`
            INSERT INTO "users" (
                "id", "name", "email", "password_hash", "created_at", "updated_at"
            ) VALUES (
                uuid_generate_v4(), 'Admin User', 'admin@excellent.com', '$2b$10$TWCQ2pHJ.kOCpsahlRhG9.E2joa4wBP/vG5R8h8JauT6fhxWCGmua', NOW(), NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
