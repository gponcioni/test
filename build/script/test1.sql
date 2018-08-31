-- ----------------------------------------------------------------------------
-- MySQL Workbench Migration
-- Migrated Schemata: mydb
-- Source Schemata: 
-- Created: Fri Aug 31 16:41:49 2018
-- Workbench Version: 6.3.10
-- ----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Schema mydb
-- ----------------------------------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;

-- ----------------------------------------------------------------------------
-- Table mydb.test1
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`test1` (
  `idtest1` INT NOT NULL,
  `test1col` VARCHAR(45) NULL,
  `test3_idtest3` INT NOT NULL,
  PRIMARY KEY (`idtest1`),
  INDEX `fk_test1_test3_idx` (`test3_idtest3` ASC),
  CONSTRAINT `fk_test1_test3`
    FOREIGN KEY (`test3_idtest3`)
    REFERENCES `mydb`.`test3` (`idtest3`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Table mydb.test2
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`test2` (
  `idtest2` INT NOT NULL,
  `test2col` DATETIME NULL,
  `test4_idtest4` INT NOT NULL,
  PRIMARY KEY (`idtest2`),
  INDEX `fk_test2_test41_idx` (`test4_idtest4` ASC),
  CONSTRAINT `fk_test2_test41`
    FOREIGN KEY (`test4_idtest4`)
    REFERENCES `mydb`.`test4` (`idtest4`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Table mydb.test3
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`test3` (
  `idtest3` INT NOT NULL,
  `test3col` DOUBLE NULL,
  `test4_idtest4` INT NOT NULL,
  PRIMARY KEY (`idtest3`, `test4_idtest4`),
  INDEX `fk_test3_test41_idx` (`test4_idtest4` ASC),
  CONSTRAINT `fk_test3_test41`
    FOREIGN KEY (`test4_idtest4`)
    REFERENCES `mydb`.`test4` (`idtest4`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Table mydb.test4
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`test4` (
  `idtest4` INT NOT NULL,
  `test4col` TINYINT(1) NULL,
  PRIMARY KEY (`idtest4`))
ENGINE = InnoDB;
SET FOREIGN_KEY_CHECKS = 1;
