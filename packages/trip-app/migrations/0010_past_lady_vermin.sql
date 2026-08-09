DROP TABLE `trip_memos`;--> statement-breakpoint
CREATE TABLE `trip_memos` (
	`id` text PRIMARY KEY NOT NULL,
	`tripId` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`createdBy` text NOT NULL,
	`updatedBy` text,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
