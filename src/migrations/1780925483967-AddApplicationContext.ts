import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationContext1780925483967 implements MigrationInterface {
    name = 'AddApplicationContext1780925483967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."applications_status_enum" AS ENUM('active', 'disabled')`);
        await queryRunner.query(`CREATE TABLE "applications" ("id" uuid NOT NULL, "version" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "app_id" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "description" text, "status" "public"."applications_status_enum" NOT NULL DEFAULT 'active', "refresh_token_expiration_seconds" integer NOT NULL DEFAULT '2592000', "max_sessions_per_user" integer NOT NULL DEFAULT '5', "strict_ip_validation" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_applications_app_id" ON "applications" ("app_id") `);
        await queryRunner.query(`INSERT INTO "applications" ("id", "app_id", "name", "description") VALUES ('00000000-0000-0000-0000-000000000001', 'legacy', 'Legacy Client', 'Default application context for existing clients')`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "app_id" character varying(100) NOT NULL DEFAULT 'legacy'`);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_app_id" ON "sessions" ("app_id") `);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_app_id_applications_app_id" FOREIGN KEY ("app_id") REFERENCES "applications"("app_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_app_id_applications_app_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_app_id"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "app_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_applications_app_id"`);
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    }
}
