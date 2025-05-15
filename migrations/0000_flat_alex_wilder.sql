CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `appeal_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`appeal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`appeal` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`appeal_id`) REFERENCES `appeals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_appeal_reply_on_appeal_id` ON `appeal_replies` (`appeal_id`);--> statement-breakpoint
CREATE INDEX `index_appeal_reply_on_user_id` ON `appeal_replies` (`user_id`);--> statement-breakpoint
CREATE TABLE `appeals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_of_appeal_id` text NOT NULL,
	`daily_report_id` text NOT NULL,
	`appeal` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_of_appeal_id`) REFERENCES `categories_of_appeal`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`daily_report_id`) REFERENCES `daily_reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_appeal_on_category_of_appeal_id` ON `appeals` (`category_of_appeal_id`);--> statement-breakpoint
CREATE INDEX `index_appeal_on_dairy_report_id` ON `appeals` (`daily_report_id`);--> statement-breakpoint
CREATE INDEX `index_appeal_on_user_id` ON `appeals` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories_of_appeal` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `index_categories_of_appeal_on_name` ON `categories_of_appeal` (`name`);--> statement-breakpoint
CREATE TABLE `categories_of_trouble` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `index_categories_of_trouble_on_name` ON `categories_of_trouble` (`name`);--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`like_keywords` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `index_clients_on_name_and_like_keywords` ON `clients` (`name`,`like_keywords`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`daily_report_id` text NOT NULL,
	`comment` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`daily_report_id`) REFERENCES `daily_reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_comments_on_daily_report_id` ON `comments` (`daily_report_id`);--> statement-breakpoint
CREATE INDEX `index_comments_on_user_id` ON `comments` (`user_id`);--> statement-breakpoint
CREATE TABLE `daily_report_missions` (
	`id` text PRIMARY KEY NOT NULL,
	`work_content` text NOT NULL,
	`mission_id` text NOT NULL,
	`daily_report_id` text NOT NULL,
	`hours` real,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`daily_report_id`) REFERENCES `daily_reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_daily_report_missions_on_daily_report_id` ON `daily_report_missions` (`daily_report_id`);--> statement-breakpoint
CREATE INDEX `index_daily_report_missions_on_mission_id` ON `daily_report_missions` (`mission_id`);--> statement-breakpoint
CREATE TABLE `daily_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`report_date` integer,
	`impression` text,
	`user_id` text NOT NULL,
	`release` integer DEFAULT false NOT NULL,
	`remote` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_daily_reports_on_user_id` ON `daily_reports` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_daily_reports_on_report_date` ON `daily_reports` (`report_date`);--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`like_keywords` text NOT NULL,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_missions_on_project_id` ON `missions` (`project_id`);--> statement-breakpoint
CREATE INDEX `index_missions_on_name_and_like_keywords` ON `missions` (`name`,`like_keywords`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`user_id` text NOT NULL,
	`comment_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_notifications_on_user_id` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_notifications_on_comment_id` ON `notifications` (`comment_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`like_keywords` text NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`client_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_projects_on_client_id` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `index_projects_on_name_and_like_keywords` ON `projects` (`name`,`like_keywords`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `trouble_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`trouble_id` text NOT NULL,
	`user_id` text NOT NULL,
	`trouble` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`trouble_id`) REFERENCES `troubles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_trouble_reply_on_trouble_id` ON `trouble_replies` (`trouble_id`);--> statement-breakpoint
CREATE INDEX `index_trouble_reply_on_user_id` ON `trouble_replies` (`user_id`);--> statement-breakpoint
CREATE TABLE `troubles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_of_trouble_id` text NOT NULL,
	`trouble` text NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_of_trouble_id`) REFERENCES `categories_of_trouble`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_troubles_on_category_of_trouble_id` ON `troubles` (`category_of_trouble_id`);--> statement-breakpoint
CREATE INDEX `index_troubles_on_user_id` ON `troubles` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_troubles_on_resolved` ON `troubles` (`resolved`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `weekly_report_missions` (
	`id` text PRIMARY KEY NOT NULL,
	`weekly_report_id` text NOT NULL,
	`mission_id` text NOT NULL,
	`hours` real NOT NULL,
	`work_content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`weekly_report_id`) REFERENCES `weekly_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_weekly_report_missions_on_mission_id` ON `weekly_report_missions` (`mission_id`);--> statement-breakpoint
CREATE INDEX `index_weekly_report_missions_on_weekly_report_id` ON `weekly_report_missions` (`weekly_report_id`);--> statement-breakpoint
CREATE TABLE `weekly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`year` integer NOT NULL,
	`week` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_weekly_reports_on_user_id` ON `weekly_reports` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_weekly_reports_on_year_and_week` ON `weekly_reports` (`year`,`week`);