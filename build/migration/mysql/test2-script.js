exports.up = "CREATE TABLE `test1` (`idtest1` int NOT NULL, `test3_idtest3` int NOT NULL, INDEX `fk_test1_test3_idx` (`test3_idtest3`), PRIMARY KEY (`idtest1`)) ENGINE=InnoDB;" +
"CREATE TABLE `test3` (`idtest3` int NOT NULL, `test3col` double NULL, `test4_idtest4` int NOT NULL, INDEX `fk_test3_test41_idx` (`test4_idtest4`), UNIQUE INDEX `REL_38072c5606d4fd9f07dbcc29bd` (`test4_idtest4`), PRIMARY KEY (`idtest3`, `test4_idtest4`)) ENGINE=InnoDB;" +
"CREATE TABLE `test4` (`idtest4` int NOT NULL, `test4col` tinyint(1) NULL, `table1_idtable1` int NOT NULL, INDEX `fk_test4_table11_idx` (`table1_idtable1`), PRIMARY KEY (`idtest4`)) ENGINE=InnoDB;" +
"CREATE TABLE `table1` (`idtable1` int NOT NULL, `table1col` varchar(45) NULL, PRIMARY KEY (`idtable1`)) ENGINE=InnoDB;";

exports.down = "DROP TABLE `table1`;" +
"DROP INDEX `fk_test4_table11_idx` ON `test4`;" +
"DROP TABLE `test4`;" +
"DROP INDEX `REL_38072c5606d4fd9f07dbcc29bd` ON `test3`;" +
"DROP INDEX `fk_test3_test41_idx` ON `test3`;" +
"DROP TABLE `test3`;" +
"DROP INDEX `fk_test1_test3_idx` ON `test1`;" +
"DROP TABLE `test1`;";
