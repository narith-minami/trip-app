CREATE TABLE `facilities` (
	`id` text PRIMARY KEY NOT NULL,
	`tripId` text NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`phone` text,
	`businessHours` text,
	`url` text,
	`memo` text,
	`updatedBy` text,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `schedule_items` ADD `facilityId` text REFERENCES facilities(id);