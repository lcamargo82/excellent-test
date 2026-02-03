import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUser1770150810766 implements MigrationInterface {
    name = 'AddRoleToUser1770150810766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying(20) NOT NULL DEFAULT 'USER'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b75c92ef36f432fe68ec300a7d4" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b75c92ef36f432fe68ec300a7d4"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
    }

}
