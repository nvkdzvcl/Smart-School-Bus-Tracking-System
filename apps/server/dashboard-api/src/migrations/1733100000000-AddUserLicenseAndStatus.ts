import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserLicenseAndStatus1733100000000 implements MigrationInterface {
    name = 'AddUserLicenseAndStatus1733100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add license columns
        await queryRunner.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "license_number" varchar NULL;`)
        await queryRunner.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "license_class" varchar(50) NULL;`)
        await queryRunner.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "license_expiry" date NULL;`)
        
        // Add fcm_token
        await queryRunner.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "fcm_token" varchar NULL;`)

        // Add status column with enum
        // Check if enum type exists, if not create it
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
                    CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'locked');
                END IF;
            END $$;
        `)
        
        await queryRunner.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "status" "user_status" DEFAULT 'active';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN IF EXISTS "status";`)
        await queryRunner.query(`DROP TYPE IF EXISTS "user_status";`)
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN IF EXISTS "fcm_token";`)
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN IF EXISTS "license_expiry";`)
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN IF EXISTS "license_class";`)
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN IF EXISTS "license_number";`)
    }
}
