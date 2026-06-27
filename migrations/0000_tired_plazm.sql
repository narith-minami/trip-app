CREATE TABLE `schedule_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tripId` text NOT NULL,
	`date` text NOT NULL,
	`startTime` text,
	`title` text NOT NULL,
	`placeName` text,
	`placeUrl` text,
	`memo` text,
	`imageUrl` text,
	`orderIndex` integer DEFAULT 0 NOT NULL,
	`updatedBy` text,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`tripId` text NOT NULL,
	`title` text NOT NULL,
	`isDone` integer DEFAULT 0 NOT NULL,
	`assigneeId` text,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trip_members` (
	`tripId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joinedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`tripId`, `userId`)
);
--> statement-breakpoint
CREATE TABLE `trip_memos` (
	`tripId` text PRIMARY KEY NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`updatedBy` text,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`destination` text,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	`coverImageUrl` text,
	`ownerId` text NOT NULL,
	`inviteToken` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trips_inviteToken_unique` ON `trips` (`inviteToken`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT 0 NOT NULL,
	`image` text,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);