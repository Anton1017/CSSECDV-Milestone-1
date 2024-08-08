-- CreateTable
CREATE TABLE `commentlikes` (
    `CommentLikeID` VARCHAR(45) NOT NULL DEFAULT (uuid()),
    `CommentID` VARCHAR(45) NULL,
    `UserID` VARCHAR(45) NULL,

    INDEX `CommentLikeID_idx`(`CommentID`),
    INDEX `UserLikedCommentID_idx`(`UserID`),
    PRIMARY KEY (`CommentLikeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postcomments` (
    `PostCommentID` VARCHAR(45) NOT NULL DEFAULT (uuid()),
    `PostID` VARCHAR(45) NOT NULL,
    `CommenterID` VARCHAR(45) NOT NULL,
    `TextContent` VARCHAR(255) NULL,
    `ImageContent` VARCHAR(48) NULL,
    `ParentCommentID` VARCHAR(45) NULL,
    `NumComments` INTEGER NOT NULL DEFAULT 0,
    `TimeCommented` DATETIME(0) NOT NULL DEFAULT (now()),

    INDEX `CommenterID_idx`(`CommenterID`),
    INDEX `ParentCommentID_idx`(`ParentCommentID`),
    INDEX `PostID_idx`(`PostID`),
    PRIMARY KEY (`PostCommentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postlikes` (
    `PostLikeID` VARCHAR(45) NOT NULL DEFAULT (uuid()),
    `PostID` VARCHAR(45) NOT NULL,
    `UserID` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `PostLikeID_UNIQUE`(`PostLikeID`),
    INDEX `PostLikedID_idx`(`PostID`),
    INDEX `UserLikePostID_idx`(`UserID`),
    PRIMARY KEY (`PostLikeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `PostID` VARCHAR(45) NOT NULL DEFAULT (uuid()),
    `UserID` VARCHAR(45) NOT NULL,
    `Title` VARCHAR(45) NOT NULL,
    `TextContent` VARCHAR(45) NULL,
    `ImageContent` VARCHAR(48) NULL,
    `NumLikes` INTEGER NOT NULL DEFAULT 0,
    `TimePosted` DATETIME(0) NULL DEFAULT (now()),
    `isPinned` TINYINT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT NOT NULL DEFAULT 0,

    INDEX `PosterID_idx`(`UserID`),
    PRIMARY KEY (`PostID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usercredentials` (
    `Username` VARCHAR(45) NOT NULL,
    `Password` VARCHAR(60) NOT NULL,
    `PasswordSalt` VARCHAR(45) NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `UserID` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `Username_UNIQUE`(`Username`),
    INDEX `user_id_idx`(`UserID`),
    PRIMARY KEY (`Username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `UserID` VARCHAR(45) NOT NULL DEFAULT (uuid()),
    `Email` VARCHAR(45) NOT NULL,
    `FullName` VARCHAR(45) NOT NULL,
    `ContactNumber` VARCHAR(15) NOT NULL,
    `DateRegistered` DATETIME(0) NOT NULL DEFAULT (now()),
    `DateModified` DATETIME(0) NOT NULL DEFAULT (now()),
    `ProfileImg` VARCHAR(48) NOT NULL,
    `Bio` VARCHAR(100) NULL,
    `FavoriteQuote` VARCHAR(45) NULL,
    `FavoriteCharImg` VARCHAR(48) NULL,
    `Username` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `Email_UNIQUE`(`Email`),
    UNIQUE INDEX `Username_UNIQUE`(`Username`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `session_id` VARCHAR(128) NOT NULL,
    `expires` INTEGER UNSIGNED NOT NULL,
    `data` MEDIUMTEXT NULL,

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `commentlikes` ADD CONSTRAINT `CommentLikeID` FOREIGN KEY (`CommentID`) REFERENCES `postcomments`(`PostCommentID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `commentlikes` ADD CONSTRAINT `UserLikedCommentID` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `postcomments` ADD CONSTRAINT `CommenterID` FOREIGN KEY (`CommenterID`) REFERENCES `users`(`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `postcomments` ADD CONSTRAINT `ParentCommentID` FOREIGN KEY (`ParentCommentID`) REFERENCES `postcomments`(`PostCommentID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `postcomments` ADD CONSTRAINT `PostID` FOREIGN KEY (`PostID`) REFERENCES `posts`(`PostID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `postlikes` ADD CONSTRAINT `PostLikedID` FOREIGN KEY (`PostID`) REFERENCES `posts`(`PostID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `postlikes` ADD CONSTRAINT `UserLikePostID` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `PosterID` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usercredentials` ADD CONSTRAINT `user_id` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usercredentials` ADD CONSTRAINT `user_name` FOREIGN KEY (`Username`) REFERENCES `users`(`Username`) ON DELETE NO ACTION ON UPDATE NO ACTION;
