CREATE TABLE `beats` (
	`id` text PRIMARY KEY NOT NULL,
	`playlistItemId` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`channelId` text NOT NULL,
	`channelName` text NOT NULL,
	`dateCreated` text NOT NULL,
	`dateAddedToPlaylist` text NOT NULL,
	`thumbnailUrls` text DEFAULT '[]' NOT NULL,
	`durationInSeconds` integer NOT NULL,
	`url` text NOT NULL,
	`channelUrl` text,
	`audioFileExtension` text,
	`videoFileExtension` text,
	`isUnavailable` integer NOT NULL,
	`lufs` real
);
--> statement-breakpoint
CREATE TABLE `lyrics_beats` (
	`lyricId` integer NOT NULL,
	`beatId` text NOT NULL,
	PRIMARY KEY(`lyricId`, `beatId`),
	FOREIGN KEY (`lyricId`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`beatId`) REFERENCES `beats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lyrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlists_beats` (
	`playlistId` integer NOT NULL,
	`beatId` text NOT NULL,
	PRIMARY KEY(`playlistId`, `beatId`),
	FOREIGN KEY (`playlistId`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`beatId`) REFERENCES `beats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_userId_unique` ON `sessions` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`isAdmin` integer DEFAULT false NOT NULL,
	`avatarUrl` text,
	`avatarColor` text,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);