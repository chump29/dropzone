CREATE TABLE `loot` (
	`id` integer PRIMARY KEY,
	`max` integer NOT NULL,
	`min` integer NOT NULL,
	`name` text NOT NULL UNIQUE
);

CREATE TABLE `users` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`points` integer DEFAULT 0
);
