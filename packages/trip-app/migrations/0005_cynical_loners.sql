CREATE TABLE `todo_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`todoId` text NOT NULL,
	`authorId` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch() * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`todoId`) REFERENCES `todos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `todos` ADD `description` text;--> statement-breakpoint
ALTER TABLE `todos` ADD `dueDate` text;