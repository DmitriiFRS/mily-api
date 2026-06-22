DROP INDEX `cities_name_key` ON `cities`;

CREATE INDEX `cities_name_idx` ON `cities`(`name`);
