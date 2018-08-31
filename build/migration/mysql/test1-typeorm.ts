import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationMysql1535726514301 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `test2` (`idtest2` int NOT NULL, `test2col` datetime NULL, `test4_idtest4` int NOT NULL, INDEX `fk_test2_test41_idx` (`test4_idtest4`), PRIMARY KEY (`idtest2`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `test4` (`idtest4` int NOT NULL, `test4col` tinyint(1) NULL, PRIMARY KEY (`idtest4`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `test3` (`idtest3` int NOT NULL, `test3col` double NULL, `test4_idtest4` int NOT NULL, INDEX `fk_test3_test41_idx` (`test4_idtest4`), UNIQUE INDEX `REL_38072c5606d4fd9f07dbcc29bd` (`test4_idtest4`), PRIMARY KEY (`idtest3`, `test4_idtest4`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `test1` (`idtest1` int NOT NULL, `test1col` varchar(45) NULL, `test3_idtest3` int NOT NULL, INDEX `fk_test1_test3_idx` (`test3_idtest3`, `test3_idtest3`), PRIMARY KEY (`idtest1`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP INDEX `fk_test1_test3_idx` ON `test1`");
        await queryRunner.query("DROP TABLE `test1`");
        await queryRunner.query("DROP INDEX `REL_38072c5606d4fd9f07dbcc29bd` ON `test3`");
        await queryRunner.query("DROP INDEX `fk_test3_test41_idx` ON `test3`");
        await queryRunner.query("DROP TABLE `test3`");
        await queryRunner.query("DROP TABLE `test4`");
        await queryRunner.query("DROP INDEX `fk_test2_test41_idx` ON `test2`");
        await queryRunner.query("DROP TABLE `test2`");
    }

}
