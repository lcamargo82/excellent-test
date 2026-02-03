import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStockSchema1770151654511 implements MigrationInterface {
    name = 'FixStockSchema1770151654511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
    }

}
