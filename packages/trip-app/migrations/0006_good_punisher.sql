CREATE TABLE `schedule_item_images` (
	`id` text PRIMARY KEY NOT NULL,
	`scheduleItemId` text NOT NULL,
	`imageUrl` text NOT NULL,
	`orderIndex` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`scheduleItemId`) REFERENCES `schedule_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `schedule_items` DROP COLUMN `imageUrl`;