CREATE TABLE `scrap_tags` (
	`scrapId` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`scrapId`, `tag`)
);
--> statement-breakpoint
CREATE TABLE `scraps` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text,
	`imageData` text,
	`authorId` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);