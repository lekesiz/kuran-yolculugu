CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surahId` int NOT NULL,
	`body` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surahs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationNo` int NOT NULL,
	`surahNo` int NOT NULL,
	`nuzulOrderOkuyan` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`nameArabic` varchar(64),
	`nameMeaning` varchar(160),
	`verseCount` int NOT NULL,
	`periodDiyanet` enum('Mekke','Medine') NOT NULL,
	`periodOkuyan` enum('Mekke','Medine') NOT NULL,
	`periodDisputeNote` text,
	`revelationTiming` varchar(160),
	`stationTitle` varchar(200),
	`introduction` text,
	`occasionOfRevelation` text,
	`occasionSources` text,
	`contemporaryMeaning` text,
	`keyTerms` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `surahs_id` PRIMARY KEY(`id`),
	CONSTRAINT `surahs_stationNo_idx` UNIQUE(`stationNo`),
	CONSTRAINT `surahs_surahNo_idx` UNIQUE(`surahNo`)
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surahId` int NOT NULL,
	`label` varchar(200) NOT NULL,
	`body` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surahId` int NOT NULL,
	`verseNo` int NOT NULL,
	`verseNoEnd` int,
	`source` enum('diyanet','okuyan','islamoglu','esed') NOT NULL,
	`text` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translations_id` PRIMARY KEY(`id`),
	CONSTRAINT `translations_unique_idx` UNIQUE(`surahId`,`verseNo`,`source`)
);
--> statement-breakpoint
CREATE TABLE `userNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`surahId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userNotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `userNotes_unique_idx` UNIQUE(`userId`,`surahId`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`surahId` int NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProgress_unique_idx` UNIQUE(`userId`,`surahId`)
);
--> statement-breakpoint
CREATE TABLE `verses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surahId` int NOT NULL,
	`verseNo` int NOT NULL,
	`textArabic` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verses_id` PRIMARY KEY(`id`),
	CONSTRAINT `verses_unique_idx` UNIQUE(`surahId`,`verseNo`)
);
--> statement-breakpoint
CREATE INDEX `questions_surahId_idx` ON `questions` (`surahId`);--> statement-breakpoint
CREATE INDEX `surahs_nuzulOrderOkuyan_idx` ON `surahs` (`nuzulOrderOkuyan`);--> statement-breakpoint
CREATE INDEX `themes_surahId_idx` ON `themes` (`surahId`);--> statement-breakpoint
CREATE INDEX `translations_surah_verse_idx` ON `translations` (`surahId`,`verseNo`);