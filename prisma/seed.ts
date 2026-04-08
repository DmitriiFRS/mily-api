import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(
  process.env.DATABASE_URL ||
    'mysql://mily_user:mily_password@localhost:3306/mily',
);
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
