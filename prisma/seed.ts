import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import * as https from 'node:https';
import * as readline from 'node:readline';
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter, log: ['info', 'warn', 'error'] });
const GEONAMES_CITIES_URL =
  process.env.GEONAMES_CITIES_URL || 'https://download.geonames.org/export/dump/cities500.zip';
const GEONAMES_CITIES_ARCHIVE_PATH =
  process.env.GEONAMES_CITIES_ARCHIVE_PATH || join(tmpdir(), 'geonames-cities500.zip');
const WORLD_CITIES_BATCH_SIZE = Number(process.env.WORLD_CITIES_BATCH_SIZE || 1000);

function downloadFile(url: string, filePath: string, redirects = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error('Too many redirects while downloading GeoNames cities'));
      return;
    }

    mkdirSync(dirname(filePath), { recursive: true });
    const file = createWriteStream(filePath);

    https
      .get(url, (response) => {
        const statusCode = response.statusCode || 0;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location) {
          file.close();
          response.resume();
          downloadFile(new URL(location, url).toString(), filePath, redirects + 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (statusCode !== 200) {
          file.close();
          response.resume();
          reject(new Error(`Failed to download GeoNames cities. Status code: ${statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', reject);

    file.on('error', reject);
  });
}

function parseGeoNamesCity(line: string) {
  const fields = line.split('\t');
  const geonameId = fields[0];
  const name = fields[1];

  if (!geonameId || !name) {
    return null;
  }

  return {
    name,
    code: `geonames:${geonameId}`,
  };
}

async function seedWorldCities() {
  if (process.env.SKIP_WORLD_CITIES_SEED === 'true') {
    console.info('World cities seed skipped');
    return;
  }

  if (!existsSync(GEONAMES_CITIES_ARCHIVE_PATH) || statSync(GEONAMES_CITIES_ARCHIVE_PATH).size === 0) {
    console.info(`Downloading GeoNames cities from ${GEONAMES_CITIES_URL}`);
    await downloadFile(GEONAMES_CITIES_URL, GEONAMES_CITIES_ARCHIVE_PATH);
  }

  console.info(`Importing GeoNames cities from ${GEONAMES_CITIES_ARCHIVE_PATH}`);

  const unzip = spawn('unzip', ['-p', GEONAMES_CITIES_ARCHIVE_PATH], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const unzipClosed = new Promise<number | null>((resolve, reject) => {
    unzip.on('error', reject);
    unzip.on('close', resolve);
  });
  let unzipError = '';
  unzip.stderr.on('data', (chunk) => {
    unzipError += chunk.toString();
  });

  const rows: { name: string; code: string }[] = [];
  let parsedCount = 0;
  let createdCount = 0;

  const flushRows = async () => {
    if (rows.length === 0) {
      return;
    }
    const result = await prisma.city.createMany({
      data: rows.splice(0, rows.length),
      skipDuplicates: true,
    });
    createdCount += result.count;
  };

  const lines = readline.createInterface({
    input: unzip.stdout,
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    const city = parseGeoNamesCity(line);
    if (!city) {
      continue;
    }
    rows.push(city);
    parsedCount += 1;

    if (rows.length >= WORLD_CITIES_BATCH_SIZE) {
      await flushRows();
    }
  }

  await flushRows();

  const exitCode = await unzipClosed;
  if (exitCode !== 0) {
    throw new Error(`Failed to unzip GeoNames cities: ${unzipError.trim()}`);
  }

  console.info(`GeoNames cities parsed: ${parsedCount}, created: ${createdCount}`);
}

async function main() {
  const roles = [
    {
      id: 1,
      name: 'Перевозчик',
      slug: 'carrier',
      isAdmin: false,
    },
    {
      id: 2,
      name: 'Заказчик',
      slug: 'customer',
      isAdmin: false,
    },
    {
      id: 100,
      name: 'Супер Админ',
      slug: 'super-admin',
      isAdmin: true,
    },
    {
      id: 101,
      name: 'Админ',
      slug: 'admin',
      isAdmin: true,
    },
    {
      id: 102,
      name: 'Модератор',
      slug: 'moderator',
      isAdmin: true,
    },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { slug: roleData.slug },
      update: {
        isAdmin: roleData.isAdmin,
      },
      create: {
        id: roleData.id,
        name: roleData.name,
        slug: roleData.slug,
        isAdmin: roleData.isAdmin,
      },
    });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Superuser1', salt);

  await prisma.user.upsert({
    where: { email: 'emlysupport@gmail.com' },
    update: {
      password: hashedPassword,
      roleId: 100,
      isVerified: true,
    },
    create: {
      email: 'emlysupport@gmail.com',
      name: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      roleId: 100,
      isVerified: true,
    },
  });

  await seedWorldCities();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
//Carrier
//Customer
