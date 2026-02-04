import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductNameToOrderItems1770227742106 implements MigrationInterface {
    name = 'AddProductNameToOrderItems1770227742106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "product_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "discount_amount" SET DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "discount_amount" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "product_name"`);
    }

}
