import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationPostgres1535726524091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "mydb"."test1" ("idtest1" integer NOT NULL, "test3_idtest3" integer NOT NULL, CONSTRAINT "PK_a32ede1f0ac0bdfc9dd1b2eda69" PRIMARY KEY ("idtest1"))`);
        await queryRunner.query(`CREATE INDEX "fk_test1_test3_idx" ON "mydb"."test1"("test3_idtest3") `);
        await queryRunner.query(`CREATE TABLE "mydb"."test3" ("idtest3" integer NOT NULL, "test3col" double precision, "test4_idtest4" integer NOT NULL, CONSTRAINT "REL_38072c5606d4fd9f07dbcc29bd" UNIQUE ("test4_idtest4"), CONSTRAINT "PK_cee4d17147bb449a2afd5c54461" PRIMARY KEY ("idtest3", "test4_idtest4"))`);
        await queryRunner.query(`CREATE INDEX "fk_test3_test41_idx" ON "mydb"."test3"("test4_idtest4") `);
        await queryRunner.query(`CREATE TABLE "mydb"."test4" ("idtest4" integer NOT NULL, "test4col" integer, "table1_idtable1" integer NOT NULL, CONSTRAINT "PK_d4ce04ab044b59b6816f9080b47" PRIMARY KEY ("idtest4"))`);
        await queryRunner.query(`CREATE INDEX "fk_test4_table11_idx" ON "mydb"."test4"("table1_idtable1") `);
        await queryRunner.query(`CREATE TABLE "mydb"."table1" ("idtable1" integer NOT NULL, "table1col" character varying(45), CONSTRAINT "PK_58aec687f9c5d62b0fb11f718d9" PRIMARY KEY ("idtable1"))`);
        await queryRunner.query(`ALTER TABLE "mydb"."test1" ADD CONSTRAINT "FK_920238483fcfc3211fb9778cdbb" FOREIGN KEY ("test3_idtest3") REFERENCES "mydb"."test3"("idtest3") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mydb"."test3" ADD CONSTRAINT "FK_38072c5606d4fd9f07dbcc29bd1" FOREIGN KEY ("test4_idtest4") REFERENCES "mydb"."test4"("idtest4") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mydb"."test4" ADD CONSTRAINT "FK_b58c51c87361bf39a54e8e86013" FOREIGN KEY ("table1_idtable1") REFERENCES "mydb"."table1"("idtable1") ON DELETE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "mydb"."test4" DROP CONSTRAINT "FK_b58c51c87361bf39a54e8e86013"`);
        await queryRunner.query(`ALTER TABLE "mydb"."test3" DROP CONSTRAINT "FK_38072c5606d4fd9f07dbcc29bd1"`);
        await queryRunner.query(`ALTER TABLE "mydb"."test1" DROP CONSTRAINT "FK_920238483fcfc3211fb9778cdbb"`);
        await queryRunner.query(`DROP TABLE "mydb"."table1"`);
        await queryRunner.query(`DROP INDEX "mydb"."fk_test4_table11_idx"`);
        await queryRunner.query(`DROP TABLE "mydb"."test4"`);
        await queryRunner.query(`DROP INDEX "mydb"."fk_test3_test41_idx"`);
        await queryRunner.query(`DROP TABLE "mydb"."test3"`);
        await queryRunner.query(`DROP INDEX "mydb"."fk_test1_test3_idx"`);
        await queryRunner.query(`DROP TABLE "mydb"."test1"`);
    }

}
