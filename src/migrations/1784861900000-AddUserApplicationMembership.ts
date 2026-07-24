import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserApplicationMembership1784861900000
  implements MigrationInterface
{
  name = 'AddUserApplicationMembership1784861900000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_applications" (
        "user_id" uuid NOT NULL,
        "app_id" character varying(100) NOT NULL,
        CONSTRAINT "PK_user_applications" PRIMARY KEY ("user_id", "app_id"),
        CONSTRAINT "FK_user_applications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_applications_application" FOREIGN KEY ("app_id") REFERENCES "applications"("app_id") ON DELETE CASCADE
      )
    `);

    // Preserve existing behavior for accounts and applications already in use.
    await queryRunner.query(`
      INSERT INTO "user_applications" ("user_id", "app_id")
      SELECT u."id", a."app_id"
      FROM "users" u CROSS JOIN "applications" a
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_applications"`);
  }
}
