CREATE TABLE `wiki_views` (
	`boxOfficeId` VARCHAR(50) NOT NULL,
	`date` CHAR(10) NOT NULL,
	`views` INT(11) NOT NULL DEFAULT '0',
	PRIMARY KEY (`boxOfficeId`, `date`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB;
