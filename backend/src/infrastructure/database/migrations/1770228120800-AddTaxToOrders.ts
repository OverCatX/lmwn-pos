import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaxToOrders1770228120800 implements MigrationInterface {
    name = 'AddTaxToOrders1770228120800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "tax" numeric(10,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tax"`);
    }
}
