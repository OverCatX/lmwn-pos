import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscountAppliedAt1770228562400 implements MigrationInterface {
    name = 'AddDiscountAppliedAt1770228562400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "discount_amount" SET DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "tax" SET DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "tax" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "discount_amount" SET DEFAULT 0.00`);
    }

}
