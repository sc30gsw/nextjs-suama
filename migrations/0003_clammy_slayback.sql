ALTER TABLE `categories_of_appeal` RENAME TO `category_of_appeals`;--> statement-breakpoint
ALTER TABLE `categories_of_trouble` RENAME TO `category_of_troubles`;--> statement-breakpoint
DROP INDEX `index_categories_of_appeal_on_name`;--> statement-breakpoint
CREATE INDEX `index_category_of_appeal_on_name` ON `category_of_appeals` (`name`);--> statement-breakpoint
DROP INDEX `index_categories_of_trouble_on_name`;--> statement-breakpoint
CREATE INDEX `index_category_of_trouble_on_name` ON `category_of_troubles` (`name`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_appeals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_of_appeal_id` text NOT NULL,
	`daily_report_id` text NOT NULL,
	`appeal` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_of_appeal_id`) REFERENCES `category_of_appeals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`daily_report_id`) REFERENCES `daily_reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_appeals`("id", "user_id", "category_of_appeal_id", "daily_report_id", "appeal", "created_at", "updated_at") SELECT "id", "user_id", "category_of_appeal_id", "daily_report_id", "appeal", "created_at", "updated_at" FROM `appeals`;--> statement-breakpoint
DROP TABLE `appeals`;--> statement-breakpoint
ALTER TABLE `__new_appeals` RENAME TO `appeals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `index_appeal_on_category_of_appeal_id` ON `appeals` (`category_of_appeal_id`);--> statement-breakpoint
CREATE INDEX `index_appeal_on_dairy_report_id` ON `appeals` (`daily_report_id`);--> statement-breakpoint
CREATE INDEX `index_appeal_on_user_id` ON `appeals` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_troubles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_of_trouble_id` text NOT NULL,
	`trouble` text NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_of_trouble_id`) REFERENCES `category_of_troubles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_troubles`("id", "user_id", "category_of_trouble_id", "trouble", "resolved", "created_at", "updated_at") SELECT "id", "user_id", "category_of_trouble_id", "trouble", "resolved", "created_at", "updated_at" FROM `troubles`;--> statement-breakpoint
DROP TABLE `troubles`;--> statement-breakpoint
ALTER TABLE `__new_troubles` RENAME TO `troubles`;--> statement-breakpoint
CREATE INDEX `index_troubles_on_category_of_trouble_id` ON `troubles` (`category_of_trouble_id`);--> statement-breakpoint
CREATE INDEX `index_troubles_on_user_id` ON `troubles` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_troubles_on_resolved` ON `troubles` (`resolved`);