import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter, log: ['info', 'warn', 'error'] });

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
