import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropMessageExtraColumns1732665000000 implements MigrationInterface {
    name = 'DropMessageExtraColumns1732665000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Messages" DROP COLUMN IF EXISTS "type";`)
        await queryRunner.query(`ALTER TABLE "Messages" DROP COLUMN IF EXISTS "title";`)
        await queryRunner.query(`ALTER TABLE "Messages" DROP COLUMN IF EXISTS "priority";`)
        await queryRunner.query(`ALTER TABLE "Messages" DROP COLUMN IF EXISTS "target_group";`)
        await queryRunner.query(`ALTER TABLE "Messages" DROP COLUMN IF EXISTS "delivered_at";`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "type" varchar(20) DEFAULT 'message';`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "title" varchar(255);`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "priority" varchar(20) DEFAULT 'normal';`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "target_group" varchar(30);`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "delivered_at" timestamptz;`)
    }
}
