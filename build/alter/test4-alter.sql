-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `mydb`.`bureaus` 
ADD COLUMN `table2_idtable2` INT(11) NOT NULL AFTER `foo_id`,
ADD INDEX `fk_bureaus_table21_idx` (`table2_idtable2` ASC);

CREATE TABLE IF NOT EXISTS `mydb`.`table2` (
  `idtable2` INT(11) NOT NULL,
  `table2col` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`idtable2`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;

ALTER TABLE `mydb`.`bureaus` 
ADD CONSTRAINT `fk_bureaus_table21`
  FOREIGN KEY (`table2_idtable2`)
  REFERENCES `mydb`.`table2` (`idtable2`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
