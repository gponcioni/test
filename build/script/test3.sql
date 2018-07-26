-- ----------------------------------------------------------------------------
-- MySQL Workbench Migration
-- Migrated Schemata: mydb, mydb2
-- Source Schemata: , 
-- Created: Thu Jul 26 17:09:01 2018
-- Workbench Version: 6.3.10
-- ----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Schema mydb
-- ----------------------------------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET latin1 ;

-- ----------------------------------------------------------------------------
-- Table mydb.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `email` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}mycategory{/MwbExporter:category}\n{d:a' /* comment truncated */ /*ctAs}
  actAs:
    timestampable:
{/d:actAs}*/;

-- ----------------------------------------------------------------------------
-- Table mydb.emails
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`emails` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NULL,
  `users_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Emails_Users_idx` (`users_id` ASC),
  CONSTRAINT `fk_Emails_Users`
    FOREIGN KEY (`users_id`)
    REFERENCES `mydb`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}mycategory{/MwbExporter:category}\n{doc' /* comment truncated */ /*trine:actAs}
  actAs:
    timestampable:
{/doctrine:actAs}*/;

-- ----------------------------------------------------------------------------
-- Table mydb.bureaus
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`bureaus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NULL,
  `room` VARCHAR(45) NULL COMMENT 'Comment for the room field. This comment will be used for the field in the doctrine class and long lines will wrap with the correct indentation.\n\nNew Lines are supported as well.',
  `foo_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `testIndex` (`room` ASC),
  INDEX `fk_bureaus_foo1_idx` (`foo_id` ASC),
  CONSTRAINT `fk_bureaus_foo1`
    FOREIGN KEY (`foo_id`)
    REFERENCES `mydb`.`foo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'This is a long comment for the bureaus table. It will appear' /* comment truncated */ /*in the doctrine class and long lines will be wrapped.

Multiple lines can be entered as well.

{MwbExporter:category}mycategory{/MwbExporter:category}*/;

-- ----------------------------------------------------------------------------
-- Table mydb.users_bureaus
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`users_bureaus` (
  `users_id` INT NOT NULL,
  `bureaus_id` INT NOT NULL,
  PRIMARY KEY (`users_id`, `bureaus_id`),
  INDEX `fk_users_bureaus_bureaus1_idx` (`bureaus_id` ASC),
  CONSTRAINT `fk_users_bureaus_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `mydb`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_bureaus_bureaus1`
    FOREIGN KEY (`bureaus_id`)
    REFERENCES `mydb`.`bureaus` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}mycategory{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb.foo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`foo` (
  `id` INT NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}mycategory{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Schema mydb2
-- ----------------------------------------------------------------------------
DROP SCHEMA IF EXISTS `mydb2` ;
CREATE SCHEMA IF NOT EXISTS `mydb2` DEFAULT CHARACTER SET utf8 ;

-- ----------------------------------------------------------------------------
-- Table mydb2.testtable
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`testtable` (
  `id` INT NOT NULL,
  `decCol` DECIMAL(15,2) NULL,
  `date` DATE NULL,
  `nchar` NVARCHAR(10) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}test{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.composite1
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`composite1` (
  `key1` VARCHAR(5) NOT NULL,
  `key2` VARCHAR(5) NOT NULL,
  `my_value` VARCHAR(50) NULL,
  PRIMARY KEY (`key1`, `key2`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}composite{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.composite2
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`composite2` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key1_id` VARCHAR(5) NULL,
  `key2_id` VARCHAR(5) NULL,
  `my_col` VARCHAR(50) NULL,
  PRIMARY KEY (`id`),
  INDEX `composite_key_1_idx` (`key1_id` ASC, `key2_id` ASC),
  CONSTRAINT `composite_keys`
    FOREIGN KEY (`key1_id` , `key2_id`)
    REFERENCES `mydb2`.`composite1` (`key1` , `key2`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}composite{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.unitable1
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`unitable1` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `unitable2_id` INT NULL,
  `testcol` VARCHAR(50) NULL,
  PRIMARY KEY (`id`),
  INDEX `unitable2_unitable2_id_idx` (`unitable2_id` ASC),
  CONSTRAINT `unitable2_unitable2_id`
    FOREIGN KEY (`unitable2_id`)
    REFERENCES `mydb2`.`unitable2` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `unitable3_id`
    FOREIGN KEY (`id`)
    REFERENCES `mydb2`.`unitable3` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}unitable{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.unitable2
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`unitable2` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `unicol` VARCHAR(50) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}unitable{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.unitable3
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`unitable3` (
  `id` INT NOT NULL,
  `unicol3` VARCHAR(50) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}unitable{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.unitable4
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`unitable4` (
  `id1` INT NOT NULL,
  `id2` INT NOT NULL,
  PRIMARY KEY (`id1`, `id2`),
  INDEX `unitable5_id2_idx` (`id2` ASC),
  CONSTRAINT `unitable1_id1`
    FOREIGN KEY (`id1`)
    REFERENCES `mydb2`.`unitable1` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `unitable5_id2`
    FOREIGN KEY (`id2`)
    REFERENCES `mydb2`.`unitable5` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}unitable{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.unitable5
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`unitable5` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `col5` VARCHAR(50) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}unitable{/MwbExporter:category}';

-- ----------------------------------------------------------------------------
-- Table mydb2.tree
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb2`.`tree` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NULL,
  `parent_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `tree_parent_id_idx` (`parent_id` ASC),
  CONSTRAINT `tree_parent_id`
    FOREIGN KEY (`parent_id`)
    REFERENCES `mydb2`.`tree` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = '{MwbExporter:category}tree{/MwbExporter:category}';
SET FOREIGN_KEY_CHECKS = 1;
