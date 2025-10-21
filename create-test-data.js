const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 Создаю тестовые данные для MB-TRUST...');
    
    // Проверяем, существует ли супер-админ
    const existingAdmin = await prisma.admin.findUnique({
      where: { login: 'Max260790Bax' }
    });
    
    if (existingAdmin) {
      console.log('✅ Супер-админ уже существует:', existingAdmin.login);
    } else {
      // Хешируем пароль
      const passwordHash = await bcrypt.hash('Left4dead2-', 12);
      
      // Создаем супер-админа
      const superAdmin = await prisma.admin.create({
        data: {
          login: 'Max260790Bax',
          passwordHash,
          name: 'Супер Админ',
          role: 'SUPER_ADMIN',
          phone: '89241242417',
          email: 'shveddamir@gmail.com',
          isActive: true,
          permissions: JSON.stringify(['all'])
        }
      });
      
      console.log('✅ Супер-админ создан:', superAdmin.login);
    }
    
    // Создаем тестовых пользователей
    const testUsers = [
      {
        name: 'Иван Петров',
        email: 'ivan@test.com',
        phone: '+7900123456',
        role: 'CUSTOMER',
        level: 'NOVICE',
        balance: 5000,
        country: 'Россия',
        region: 'Москва'
      },
      {
        name: 'Мария Сидорова',
        email: 'maria@test.com',
        phone: '+7900123457',
        role: 'EXECUTOR',
        level: 'VERIFIED',
        balance: 2500,
        country: 'Россия',
        region: 'Санкт-Петербург'
      },
      {
        name: 'Алексей Козлов',
        email: 'alex@test.com',
        phone: '+7900123458',
        role: 'CUSTOMER',
        level: 'REFERRAL',
        balance: 10000,
        country: 'Россия',
        region: 'Новосибирск'
      },
      {
        name: 'Елена Новикова',
        email: 'elena@test.com',
        phone: '+7900123459',
        role: 'EXECUTOR',
        level: 'TOP',
        balance: 15000,
        country: 'Россия',
        region: 'Екатеринбург'
      }
    ];
    
    for (const userData of testUsers) {
      const passwordHash = await bcrypt.hash('test123', 12);
      
      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`✅ Пользователь уже существует: ${userData.name} (${userData.role})`);
      } else {
        const user = await prisma.user.create({
          data: {
            ...userData,
            passwordHash,
            isVerified: true,
          }
        });
        console.log(`✅ Пользователь создан: ${user.name} (${user.role})`);
      }
    }

    // Создаем тестовые заказы
    const testOrders = [
      {
        title: 'Лайки в Instagram',
        description: 'Нужно набрать 100 лайков на пост в Instagram',
        platform: 'INSTAGRAM',
        reward: 500,
        targetUrl: 'https://instagram.com/test-post',
        status: 'ACTIVE',
        customerId: null // Будет установлен после создания пользователей
      },
      {
        title: 'Подписчики в TikTok',
        description: 'Набрать 50 подписчиков в TikTok',
        platform: 'TIKTOK',
        reward: 800,
        targetUrl: 'https://tiktok.com/@test-account',
        status: 'ACTIVE',
        customerId: null
      },
      {
        title: 'Репосты в VK',
        description: 'Сделать 20 репостов записи в VK',
        platform: 'VK',
        reward: 300,
        targetUrl: 'https://vk.com/test-post',
        status: 'ACTIVE',
        customerId: null
      }
    ];

    // Получаем заказчиков
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' }
    });

    if (customers.length > 0) {
      for (let i = 0; i < testOrders.length; i++) {
        const orderData = testOrders[i];
        orderData.customerId = customers[i % customers.length].id;
        
        const existingOrder = await prisma.order.findFirst({
          where: { title: orderData.title }
        });
        
        if (!existingOrder) {
          const order = await prisma.order.create({
            data: orderData
          });
          console.log(`✅ Заказ создан: ${order.title}`);
        } else {
          console.log(`✅ Заказ уже существует: ${orderData.title}`);
        }
      }
    }

    // Создаем настройки платформы
    const platformSettings = [
      { platform: 'INSTAGRAM', basePrice: 5, multiplier: 1.2 },
      { platform: 'TIKTOK', basePrice: 8, multiplier: 1.5 },
      { platform: 'VK', basePrice: 3, multiplier: 1.0 },
      { platform: 'TELEGRAM', basePrice: 4, multiplier: 1.1 },
      { platform: 'WHATSAPP', basePrice: 6, multiplier: 1.3 },
      { platform: 'FACEBOOK', basePrice: 7, multiplier: 1.4 }
    ];

    for (const setting of platformSettings) {
      const existing = await prisma.platformSettings.findUnique({
        where: { platform: setting.platform }
      });
      
      if (!existing) {
        await prisma.platformSettings.create({
          data: setting
        });
        console.log(`✅ Настройки платформы созданы: ${setting.platform}`);
      }
    }

    // Создаем настройки комиссий
    const commissionSettings = [
      { level: 'NOVICE', rate: 0.4 },
      { level: 'VERIFIED', rate: 0.5 },
      { level: 'REFERRAL', rate: 0.6 },
      { level: 'TOP', rate: 0.8 }
    ];

    for (const setting of commissionSettings) {
      const existing = await prisma.commissionSettings.findUnique({
        where: { level: setting.level }
      });
      
      if (!existing) {
        await prisma.commissionSettings.create({
          data: setting
        });
        console.log(`✅ Настройки комиссии созданы: ${setting.level}`);
      }
    }

    console.log('🎉 Все тестовые данные созданы успешно!');
    console.log('\n📋 Тестовые данные:');
    console.log('👑 Супер-админ: Max260790Bax / Left4dead2-');
    console.log('👥 Пользователи: ivan@test.com, maria@test.com, alex@test.com, elena@test.com');
    console.log('🔑 Пароль для всех пользователей: test123');
    console.log('\n🚀 Запустите проект: npm run dev');
    console.log('🌐 Откройте: http://localhost:3000');

  } catch (error) {
    console.error('❌ Ошибка создания тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
