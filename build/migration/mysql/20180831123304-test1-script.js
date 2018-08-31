exports.up = "CREATE TABLE `test2` (`idtest2` int NOT NULL, `test2col` datetime NULL, `test4_idtest4` int NOT NULL, INDEX `fk_test2_test41_idx` (`test4_idtest4`), PRIMARY KEY (`idtest2`)) ENGINE=InnoDB;" +
"CREATE TABLE `test4` (`idtest4` int NOT NULL, `test4col` tinyint(1) NULL, PRIMARY KEY (`idtest4`)) ENGINE=InnoDB;" +
"CREATE TABLE `test3` (`idtest3` int NOT NULL, `test3col` double NULL, `test4_idtest4` int NOT NULL, INDEX `fk_test3_test41_idx` (`test4_idtest4`), UNIQUE INDEX `REL_38072c5606d4fd9f07dbcc29bd` (`test4_idtest4`), PRIMARY KEY (`idtest3`, `test4_idtest4`)) ENGINE=InnoDB;" +
"CREATE TABLE `test1` (`idtest1` int NOT NULL, `test1col` varchar(45) NULL, `test3_idtest3` int NOT NULL, INDEX `fk_test1_test3_idx` (`test3_idtest3`, `test3_idtest3`), PRIMARY KEY (`idtest1`)) ENGINE=InnoDB;";

exports.down = "DROP INDEX `fk_test1_test3_idx` ON `test1`;" +
"DROP TABLE `test1`;" +
"DROP INDEX `REL_38072c5606d4fd9f07dbcc29bd` ON `test3`;" +
"DROP INDEX `fk_test3_test41_idx` ON `test3`;" +
"DROP TABLE `test3`;" +
"DROP TABLE `test4`;" +
"DROP INDEX `fk_test2_test41_idx` ON `test2`;" +
"DROP TABLE `test2`;";
