-- CreateIndex
CREATE INDEX `ad_translations_adId_idx` ON `ad_translations`(`adId`);

-- CreateIndex
CREATE UNIQUE INDEX `ad_translations_adId_locale_key` ON `ad_translations`(`adId`, `locale`);

-- CreateIndex
CREATE INDEX `role_translations_roleId_idx` ON `role_translations`(`roleId`);

-- CreateIndex
CREATE UNIQUE INDEX `role_translations_roleId_locale_key` ON `role_translations`(`roleId`, `locale`);

-- CreateIndex
CREATE INDEX `city_translations_cityId_idx` ON `city_translations`(`cityId`);

-- CreateIndex
CREATE UNIQUE INDEX `city_translations_cityId_locale_key` ON `city_translations`(`cityId`, `locale`);

-- CreateIndex
CREATE INDEX `cargo_category_translations_cargoCategoryId_idx` ON `cargo_category_translations`(`cargoCategoryId`);

-- CreateIndex
CREATE UNIQUE INDEX `cargo_category_translations_cargoCategoryId_locale_key` ON `cargo_category_translations`(`cargoCategoryId`, `locale`);
