CREATE TABLE `todo_tags` (
	`todoId` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`todoId`, `tag`)
);
--> statement-breakpoint
ALTER TABLE `todos` ADD `priority` text DEFAULT 'medium' NOT NULL;