import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationPostgres1535726515609 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "mydb"."test2" ("idtest2" integer NOT NULL, "test2col" TIMESTAMP, "test4_idtest4" integer NOT NULL, CONSTRAINT "PK_96809b608416722ffed285feff1" PRIMARY KEY ("idtest2"))`);
        await queryRunner.query(`CREATE INDEX "fk_test2_test41_idx" ON "mydb"."test2"("test4_idtest4") `);
        await queryRunner.query(`CREATE TABLE "mydb"."test4" ("idtest4" integer NOT NULL, "test4col" integer, CONSTRAINT "PK_d4ce04ab044b59b6816f9080b47" PRIMARY KEY ("idtest4"))`);
        await queryRunner.query(`CREATE TABLE "mydb"."test3" ("idtest3" integer NOT NULL, "test3col" double precision, "test4_idtest4" integer NOT NULL, CONSTRAINT "REL_38072c5606d4fd9f07dbcc29bd" UNIQUE ("test4_idtest4"), CONSTRAINT "PK_cee4d17147bb449a2afd5c54461" PRIMARY KEY ("idtest3", "test4_idtest4"))`);
        await queryRunner.query(`CREATE INDEX "fk_test3_test41_idx" ON "mydb"."test3"("test4_idtest4") `);
        await queryRunner.query(`CREATE TABLE "mydb"."test1" ("idtest1" integer NOT NULL, "test1col" character varying(45), "test3_idtest3" integer NOT NULL, CONSTRAINT "PK_a32ede1f0ac0bdfc9dd1b2eda69" PRIMARY KEY ("idtest1"))`);
        await queryRunner.query(`CREATE INDEX "fk_test1_test3_idx" ON "mydb"."test1"("test3_idtest3", "test3_idtest3") `);
        await queryRunner.query(`ALTER TABLE "mydb"."test2" ADD CONSTRAINT "FK_13f53c4c588522543c2e1b0a329" FOREIGN KEY ("test4_idtest4") REFERENCES "mydb"."test4"("idtest4") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mydb"."test3" ADD CONSTRAINT "FK_38072c5606d4fd9f07dbcc29bd1" FOREIGN KEY ("test4_idtest4") REFERENCES "mydb"."test4"("idtest4") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mydb"."test1" ADD CONSTRAINT "FK_eaa59fe8fa848d3d1af3fc267eb" FOREIGN KEY ("test3_idtest3", "test3_idtest3") REFERENCES "mydb"."test3"("idtest3","test4_idtest4") ON DELETE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "mydb"."test1" DROP CONSTRAINT "FK_eaa59fe8fa848d3d1af3fc267eb"`);
        await queryRunner.query(`ALTER TABLE "mydb"."test3" DROP CONSTRAINT "FK_38072c5606d4fd9f07dbcc29bd1"`);
        await queryRunner.query(`ALTER TABLE "mydb"."test2" DROP CONSTRAINT "FK_13f53c4c588522543c2e1b0a329"`);
        await queryRunner.query(`DROP INDEX "mydb"."fk_test1_test3_idx"`);
        await queryRunner.query(`DROP TABLE "mydb"."test1"`);
        await queryRunner.query(`DROP INDEX "mydb"."fk_test3_test41_idx"`);
        await queryRunner.query(`DROP TABLE "mydb"."test3"`);
        await queryRunner.query(`DROP TABLE "mydb"."test4"`);
        await queryRunner.query(`DROP INDEX "mydb"."fk_test2_test41_idx"`);
        await queryRunner.query(`DROP TABLE "mydb"."test2"`);
    }

}
