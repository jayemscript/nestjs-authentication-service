import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserEntity1780736192978 implements MigrationInterface {
    name = 'AddedUserEntity1780736192978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'deactivated', 'locked', 'suspended')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "version" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying(255) NOT NULL, "username" character varying(50) NOT NULL, "password" character varying(255) NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "last_login_at" TIMESTAMP, "failed_login_attempts" integer NOT NULL DEFAULT '0', "locked_until" TIMESTAMP, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }

}
