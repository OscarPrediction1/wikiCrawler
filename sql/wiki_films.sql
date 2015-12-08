CREATE TABLE `wiki_films` (
	`boxOfficeId` VARCHAR(50) NOT NULL,
	`pageid` INT(11) NULL DEFAULT NULL,
	`title` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`boxOfficeId`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB;
