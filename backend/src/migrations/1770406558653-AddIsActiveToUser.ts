import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToUser1770406558653 implements MigrationInterface {
    name = 'AddIsActiveToUser1770406558653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        // await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "document" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "document" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
    }

}
