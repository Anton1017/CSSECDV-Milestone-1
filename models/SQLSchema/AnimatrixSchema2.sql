-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema animatrix
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema animatrix
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `animatrix` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `animatrix` ;

-- -----------------------------------------------------
-- Table `animatrix`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `animatrix`.`Users` (
  `UsersID` VARCHAR(45) NOT NULL DEFAULT (UUID()),
  `Username` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Password` VARCHAR(60) NOT NULL,
  `PasswordSalt` VARCHAR(45) NOT NULL,
  `ProfileImg` VARCHAR(48) NOT NULL,
  `FullName` VARCHAR(45) NOT NULL,
  `ContactNumber` VARCHAR(15) NOT NULL,
  `DateRegistered` DATETIME NOT NULL DEFAULT (NOW()),
  `DateModified` DATETIME NOT NULL DEFAULT (NOW()),
  `IsAdmin` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`UsersID`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE,
  UNIQUE INDEX `Username_UNIQUE` (`Username` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `animatrix`.`UserProfile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `animatrix`.`UserProfile` (
  `UserProfileID` VARCHAR(45) NOT NULL DEFAULT (UUID()),
  `UserID` VARCHAR(45) NOT NULL,
  `Bio` VARCHAR(45) NULL,
  `FavQuote` VARCHAR(45) NULL,
  `FaveCharImg` VARCHAR(45) NULL,
  PRIMARY KEY (`UserProfileID`),
  INDEX `ProfileUserID_idx` (`UserID` ASC) VISIBLE,
  UNIQUE INDEX `UserProfileID_UNIQUE` (`UserProfileID` ASC) VISIBLE,
  CONSTRAINT `ProfileUserID`
    FOREIGN KEY (`UserID`)
    REFERENCES `animatrix`.`Users` (`UsersID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `animatrix`.`Posts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `animatrix`.`Posts` (
  `PostID` VARCHAR(45) NOT NULL DEFAULT (UUID()),
  `UserID` VARCHAR(45) NOT NULL,
  `Title` VARCHAR(45) NOT NULL,
  `TextContent` VARCHAR(45) NULL,
  `ImageContent` VARCHAR(45) NULL,
  `NumLikes` INT NOT NULL DEFAULT 0,
  `TimePosted` DATETIME NULL DEFAULT (NOW()),
  PRIMARY KEY (`PostID`),
  INDEX `PosterID_idx` (`UserID` ASC) VISIBLE,
  CONSTRAINT `PosterID`
    FOREIGN KEY (`UserID`)
    REFERENCES `animatrix`.`Users` (`UsersID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `animatrix`.`PostComments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `animatrix`.`PostComments` (
  `PostCommentID` VARCHAR(45) NOT NULL DEFAULT (UUID()),
  `PostID` VARCHAR(45) NOT NULL,
  `CommenterID` VARCHAR(45) NOT NULL,
  `TextContent` VARCHAR(255) NULL,
  `ImageContent` VARCHAR(45) NULL,
  `ParentCommentID` VARCHAR(45) NULL,
  `NumComments` INT NOT NULL DEFAULT 0,
  `TimeCommented` DATETIME NOT NULL DEFAULT (NOW()),
  PRIMARY KEY (`PostCommentID`),
  INDEX `CommenterID_idx` (`CommenterID` ASC) VISIBLE,
  INDEX `PostID_idx` (`PostID` ASC) VISIBLE,
  INDEX `ParentCommentID_idx` (`ParentCommentID` ASC) VISIBLE,
  CONSTRAINT `CommenterID`
    FOREIGN KEY (`CommenterID`)
    REFERENCES `animatrix`.`Users` (`UsersID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `PostID`
    FOREIGN KEY (`PostID`)
    REFERENCES `animatrix`.`Posts` (`PostID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ParentCommentID`
    FOREIGN KEY (`ParentCommentID`)
    REFERENCES `animatrix`.`PostComments` (`PostCommentID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `animatrix`.`CommentLikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `animatrix`.`CommentLikes` (
  `CommentLikeID` VARCHAR(45) NOT NULL DEFAULT (UUID()),
  `CommentID` VARCHAR(45) NULL,
  `UserID` VARCHAR(45) NULL,
  PRIMARY KEY (`CommentLikeID`),
  INDEX `CommentLikeID_idx` (`CommentID` ASC) VISIBLE,
  INDEX `UserLikedCommentID_idx` (`UserID` ASC) VISIBLE,
  CONSTRAINT `CommentLikeID`
    FOREIGN KEY (`CommentID`)
    REFERENCES `animatrix`.`PostComments` (`PostCommentID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `UserLikedCommentID`
    FOREIGN KEY (`UserID`)
    REFERENCES `animatrix`.`Users` (`UsersID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `animatrix`.`PostLikes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `animatrix`.`PostLikes` (
  `PostLikeID` VARCHAR(45) NOT NULL DEFAULT (UUID()),
  `PostID` VARCHAR(45) NOT NULL,
  `UserID` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`PostLikeID`),
  INDEX `UserLikePostID_idx` (`UserID` ASC) VISIBLE,
  INDEX `PostLikedID_idx` (`PostID` ASC) VISIBLE,
  UNIQUE INDEX `PostLikeID_UNIQUE` (`PostLikeID` ASC) VISIBLE,
  CONSTRAINT `UserLikePostID`
    FOREIGN KEY (`UserID`)
    REFERENCES `animatrix`.`Users` (`UsersID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `PostLikedID`
    FOREIGN KEY (`PostID`)
    REFERENCES `animatrix`.`Posts` (`PostID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
