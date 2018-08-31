exports.up = `CREATE TABLE "test1" ("idtest1" integer PRIMARY KEY NOT NULL, "test3_idtest3" integer NOT NULL);
CREATE INDEX "fk_test1_test3_idx" ON "test1" ("test3_idtest3") ;
CREATE TABLE "test3" ("idtest3" integer NOT NULL, "test3col" double, "test4_idtest4" integer NOT NULL, CONSTRAINT "REL_38072c5606d4fd9f07dbcc29bd" UNIQUE ("test4_idtest4"), PRIMARY KEY ("idtest3", "test4_idtest4"));
CREATE INDEX "fk_test3_test41_idx" ON "test3" ("test4_idtest4") ;
CREATE TABLE "test4" ("idtest4" integer PRIMARY KEY NOT NULL, "test4col" tinyint, "table1_idtable1" integer NOT NULL);
CREATE INDEX "fk_test4_table11_idx" ON "test4" ("table1_idtable1") ;
CREATE TABLE "table1" ("idtable1" integer PRIMARY KEY NOT NULL, "table1col" varchar(45));`;

exports.down = `DROP TABLE "table1";
DROP INDEX "fk_test4_table11_idx";
DROP TABLE "test4";
DROP INDEX "fk_test3_test41_idx";
DROP TABLE "test3";
DROP INDEX "fk_test1_test3_idx";
DROP TABLE "test1";`;
