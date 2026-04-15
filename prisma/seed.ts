import { PrismaClient } from '../generated/prisma';
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

  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 1; i <= 10; i++) {
    const isEmail = i % 2 === 0;
    const identifier = isEmail ? { email: `user${i}@example.com` } : { phoneNumber: `+7999000000${i - 1}` };

    await prisma.user.upsert({
      where: identifier,
      update: {},
      create: {
        name: `Test User ${i}`,
        password: hashedPassword,
        roleId: isEmail ? 1 : 2, // 1 for Carrier, 2 for Customer
        isVerified: true,
        ...identifier,
      },
    });
  }

  // --- Start of new cities code ---
  const cities = [
    { name: 'Москва', code: 'MOW' },
    { name: 'Санкт-Петербург', code: 'LED' },
    { name: 'Новосибирск', code: 'OVB' },
    { name: 'Екатеринбург', code: 'SVX' },
    { name: 'Казань', code: 'KZN' },
    { name: 'Нижний Новгород', code: 'GOJ' },
    { name: 'Челябинск', code: 'CEK' },
    { name: 'Самара', code: 'KUF' },
    { name: 'Омск', code: 'OMS' },
    { name: 'Ростов-на-Дону', code: 'ROV' },
    { name: 'Уфа', code: 'UFA' },
    { name: 'Красноярск', code: 'KJA' },
    { name: 'Воронеж', code: 'VOZ' },
    { name: 'Пермь', code: 'PEE' },
    { name: 'Волгоград', code: 'VOG' },
    { name: 'Краснодар', code: 'KRR' },
    { name: 'Саратов', code: 'RTW' },
    { name: 'Тюмень', code: 'TJM' },
    { name: 'Махачкала', code: 'MCX' },
    { name: 'Владивосток', code: 'VVO' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { code: city.code },
      update: { name: city.name },
      create: city,
    });
  }

  // --- Start of new cargo categories code ---
  const cargoCategories = [
    'ТНП (Товары народного потребления)',
    'Мебель',
    'Строительные материалы',
    'Продукты питания',
    'Электроника и бытовая техника',
    'Одежда и обувь',
    'Сыпучие грузы',
    'Опасные грузы',
    'Хрупкие грузы',
    'Автомобили и мототехника',
    'Автомобильные запчасти',
    'Промышленное оборудование',
    'Личные вещи (квартирный переезд)',
    'Медикаменты',
  ];

  for (const category of cargoCategories) {
    await prisma.cargoCategory.upsert({
      where: { name: category },
      update: {},
      create: { name: category },
    });
  }

  // --- Start of new ads code ---
  const users = await prisma.user.findMany();
  const dbCities = await prisma.city.findMany();
  const dbCategories = await prisma.cargoCategory.findMany();

  if (users.length > 0 && dbCities.length >= 2 && dbCategories.length > 0) {
    // Clear old seeded ads to prevent duplication on multiple seed runs
    // Only delete ads with "Тестовое объявление" in description to avoid wiping real ads if any
    await prisma.ad.deleteMany({
      where: {
        description: { startsWith: 'Тестовое объявление' },
      },
    });

    let adCounter = 0;

    for (const user of users) {
      // 2 or 3 ads per user
      const adsCount = Math.random() > 0.5 ? 3 : 2;

      for (let j = 0; j < adsCount; j++) {
        adCounter++;

        const originCity = dbCities[Math.floor(Math.random() * dbCities.length)];
        let destCity = dbCities[Math.floor(Math.random() * dbCities.length)];
        while (destCity.id === originCity.id) {
          destCity = dbCities[Math.floor(Math.random() * dbCities.length)];
        }

        const category = dbCategories[Math.floor(Math.random() * dbCategories.length)];

        const type = adCounter % 2 === 0 ? 'CARGO' : 'TRANSPORT';
        const status = adCounter % 7 === 0 ? 'COMPLETED' : 'ACTIVE'; // Most are ACTIVE, every 7th is COMPLETED

        const dateFrom = new Date();
        const dateTo = new Date();
        dateTo.setDate(dateFrom.getDate() + Math.floor(Math.random() * 10) + 1);

        await prisma.ad.create({
          data: {
            type: type as any,
            status: status as any,
            dateFrom,
            dateTo,
            weightKg: Math.floor(Math.random() * 20000) + 100,
            description: `Тестовое объявление #${adCounter}. Надежная и быстрая доставка.`,
            price: Math.floor(Math.random() * 50000) + 5000,

            cargoCategoryId: category.id,
            authorId: user.id,
            originCityId: originCity.id,
            destinationCityId: destCity.id,
          },
        });
      }
    }
  }

  // --- Start of new reviews code ---
  const targetEmail = 'dmitriifrs@gmail.com';
  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail },
  });
  if (targetUser) {
    const senders = await prisma.user.findMany({
      where: { id: { not: targetUser.id } },
      take: 6,
    });
    if (senders.length > 0) {
      await prisma.review.deleteMany({
        where: { receiverId: targetUser.id },
      });
      const reviewData = [
        { rating: 5, text: 'Отличный партнер! Всё вовремя, без лишних вопросов.' },
        { rating: 4, text: 'Всё прошло хорошо, но была небольшая задержка на погрузке.' },
        { rating: 5, text: 'Рекомендую к сотрудничеству. Очень вежливый и пунктуальный.' },
        { rating: 2, text: 'Сложно было выйти на связь, условия немного изменились.' },
        { rating: 5, text: 'Идеальная сделка, всё по договоренности. Будем работать еще.' },
        { rating: 4, text: 'Хороший опыт, есть мелкие недочеты, но в целом всё отлично.' },
      ];
      let sum = 0;
      let count = 0;

      for (let i = 0; i < Math.min(reviewData.length, senders.length); i++) {
        const data = reviewData[i];
        const sender = senders[i];

        await prisma.review.create({
          data: {
            text: data.text,
            rating: data.rating,
            senderId: sender.id,
            receiverId: targetUser.id,
          },
        });

        sum += data.rating;
        count++;
      }
      const newRating = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          reviewsCount: count,
          ratingSum: sum,
          rating: newRating,
        },
      });
      console.log(`Сгенерировано ${count} отзывов для ${targetEmail}. Текущий рейтинг: ${newRating}`);
    }
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
