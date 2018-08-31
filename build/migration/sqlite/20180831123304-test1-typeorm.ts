import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationSqlite1535726516881 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "test2" ("idtest2" integer PRIMARY KEY NOT NULL, "test2col" datetime, "test4_idtest4" integer NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "fk_test2_test41_idx" ON "test2" ("test4_idtest4") `);
        await queryRunner.query(`CREATE TABLE "test4" ("idtest4" integer PRIMARY KEY NOT NULL, "test4col" tinyint)`);
        await queryRunner.query(`CREATE TABLE "test3" ("idtest3" integer NOT NULL, "test3col" double, "test4_idtest4" integer NOT NULL, CONSTRAINT "REL_38072c5606d4fd9f07dbcc29bd" UNIQUE ("test4_idtest4"), PRIMARY KEY ("idtest3", "test4_idtest4"))`);
        await queryRunner.query(`CREATE INDEX "fk_test3_test41_idx" ON "test3" ("test4_idtest4") `);
        await queryRunner.query(`CREATE TABLE "test1" ("idtest1" integer PRIMARY KEY NOT NULL, "test1col" varchar(45), "test3_idtest3" integer NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "fk_test1_test3_idx" ON "test1" ("test3_idtest3", "test3_idtest3") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "fk_test1_test3_idx"`);
        await queryRunner.query(`DROP TABLE "test1"`);
        await queryRunner.query(`DROP INDEX "fk_test3_test41_idx"`);
        await queryRunner.query(`DROP TABLE "test3"`);
        await queryRunner.query(`DROP TABLE "test4"`);
        await queryRunner.query(`DROP INDEX "fk_test2_test41_idx"`);
        await queryRunner.query(`DROP TABLE "test2"`);
    }

}
