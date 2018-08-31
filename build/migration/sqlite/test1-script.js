exports.up = `CREATE TABLE "test2" ("idtest2" integer PRIMARY KEY NOT NULL, "test2col" datetime, "test4_idtest4" integer NOT NULL);
CREATE INDEX "fk_test2_test41_idx" ON "test2" ("test4_idtest4") ;
CREATE TABLE "test4" ("idtest4" integer PRIMARY KEY NOT NULL, "test4col" tinyint);
CREATE TABLE "test3" ("idtest3" integer NOT NULL, "test3col" double, "test4_idtest4" integer NOT NULL, CONSTRAINT "REL_38072c5606d4fd9f07dbcc29bd" UNIQUE ("test4_idtest4"), PRIMARY KEY ("idtest3", "test4_idtest4"));
CREATE INDEX "fk_test3_test41_idx" ON "test3" ("test4_idtest4") ;
CREATE TABLE "test1" ("idtest1" integer PRIMARY KEY NOT NULL, "test1col" varchar(45), "test3_idtest3" integer NOT NULL);
CREATE INDEX "fk_test1_test3_idx" ON "test1" ("test3_idtest3", "test3_idtest3") ;`;

exports.down = `DROP INDEX "fk_test1_test3_idx";
DROP TABLE "test1";
DROP INDEX "fk_test3_test41_idx";
DROP TABLE "test3";
DROP TABLE "test4";
DROP INDEX "fk_test2_test41_idx";
DROP TABLE "test2";`;
