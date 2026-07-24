import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenHashToSession1784861800000
  implements MigrationInterface
{
  name = 'AddRefreshTokenHashToSession1784861800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "sessions" ADD "refresh_token_hash" character varying(64)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "sessions" DROP COLUMN "refresh_token_hash"',
    );
  }
}
