import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChatInit1732660000000 implements MigrationInterface {
    name = 'ChatInit1732660000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "Conversations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "participant_1_id" uuid NULL,
        "participant_2_id" uuid NULL,
        "last_message_preview" text NULL,
        "last_message_at" timestamptz NOT NULL DEFAULT NOW(),
        "created_at" timestamptz NOT NULL DEFAULT NOW(),
        "updated_at" timestamptz NOT NULL DEFAULT NOW()
      );
    `)
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_participants_index" ON "Conversations" ("participant_1_id", "participant_2_id");
    `)

        // Ensure pgcrypto for gen_random_uuid exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)

        // Extend Messages
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "type" varchar(20) DEFAULT 'message';`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "title" varchar(255);`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "priority" varchar(20) DEFAULT 'normal';`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "target_group" varchar(30);`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "conversation_id" uuid;`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "sender_id" uuid;`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "recipient_id" uuid;`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "is_read" boolean DEFAULT false;`)
        await queryRunner.query(`ALTER TABLE "Messages" ADD COLUMN IF NOT EXISTS "delivered_at" timestamptz;`)

        // FKs (optional; use ON DELETE behaviors similar to entities)
        await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_messages_conversation' AND table_name='Messages'
        ) THEN
          ALTER TABLE "Messages" ADD CONSTRAINT fk_messages_conversation FOREIGN KEY ("conversation_id") REFERENCES "Conversations"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `)
        await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_messages_sender' AND table_name='Messages'
        ) THEN
          ALTER TABLE "Messages" ADD CONSTRAINT fk_messages_sender FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `)
        await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_messages_recipient' AND table_name='Messages'
        ) THEN
          ALTER TABLE "Messages" ADD CONSTRAINT fk_messages_recipient FOREIGN KEY ("recipient_id") REFERENCES "Users"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "Messages" DROP CONSTRAINT IF EXISTS fk_messages_recipient;
      ALTER TABLE "Messages" DROP CONSTRAINT IF EXISTS fk_messages_sender;
      ALTER TABLE "Messages" DROP CONSTRAINT IF EXISTS fk_messages_conversation;
    `)
        await queryRunner.query(`
      ALTER TABLE "Messages"
        DROP COLUMN IF EXISTS "delivered_at",
        DROP COLUMN IF EXISTS "is_read",
        DROP COLUMN IF EXISTS "recipient_id",
        DROP COLUMN IF EXISTS "sender_id",
        DROP COLUMN IF EXISTS "conversation_id",
        DROP COLUMN IF EXISTS "target_group",
        DROP COLUMN IF EXISTS "priority",
        DROP COLUMN IF EXISTS "title",
        DROP COLUMN IF EXISTS "type";
    `)
        await queryRunner.query(`DROP INDEX IF EXISTS "uq_participants_index";`)
        await queryRunner.query(`DROP TABLE IF EXISTS "Conversations";`)
    }
}
