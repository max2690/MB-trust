import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 Создание тестовых данных...');

    // Создаем тестовых пользователей
    const testUsers = [
      // Исполнители
      {
        name: 'Алексей Петров',
        email: 'alexey@test.com',
        phone: '+7 (999) 111-11-11',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'EXECUTOR',
        level: 'VERIFIED',
        balance: 15000,
        country: 'Россия',
        region: 'Москва',
        isVerified: true,
        telegramId: '111111111'
      },
      {
        name: 'Мария Сидорова',
        email: 'maria@test.com',
        phone: '+7 (999) 222-22-22',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'EXECUTOR',
        level: 'TOP',
        balance: 25000,
        country: 'Россия',
        region: 'Санкт-Петербург',
        isVerified: true,
        telegramId: '222222222'
      },
      {
        name: 'Дмитрий Козлов',
        email: 'dmitry@test.com',
        phone: '+7 (999) 333-33-33',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'EXECUTOR',
        level: 'NOVICE',
        balance: 5000,
        country: 'Россия',
        region: 'Екатеринбург',
        isVerified: false,
        telegramId: '333333333'
      },
      // Заказчики
      {
        name: 'Анна Волкова',
        email: 'anna@test.com',
        phone: '+7 (999) 444-44-44',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'CUSTOMER',
        level: 'VERIFIED',
        balance: 50000,
        country: 'Россия',
        region: 'Москва',
        isVerified: true,
        telegramId: '444444444'
      },
      {
        name: 'Сергей Морозов',
        email: 'sergey@test.com',
        phone: '+7 (999) 555-55-55',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'CUSTOMER',
        level: 'TOP',
        balance: 100000,
        country: 'Россия',
        region: 'Новосибирск',
        isVerified: true,
        telegramId: '555555555'
      },
      {
        name: 'Елена Новикова',
        email: 'elena@test.com',
        phone: '+7 (999) 666-66-66',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'CUSTOMER',
        level: 'NOVICE',
        balance: 15000,
        country: 'Россия',
        region: 'Казань',
        isVerified: false,
        telegramId: '666666666'
      }
    ];

    // Создаем пользователей
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        createdUsers.push(user);
        console.log(`✅ Создан пользователь: ${user.name} (${user.role})`);
      } catch (error) {
        console.log(`⚠️ Пользователь уже существует: ${userData.name}`);
      }
    }

    // Создаем тестовые заказы
    const customers = createdUsers.filter(u => u.role === 'CUSTOMER');
    const executors = createdUsers.filter(u => u.role === 'EXECUTOR');

    if (customers.length > 0 && executors.length > 0) {
      const testOrders = [
        {
          title: 'Продвижение нового продукта в Instagram',
          description: 'Нужно разместить рекламу нового косметического продукта в Instagram Stories. Требуется качественный контент с призывом к действию.',
          targetAudience: 'Женщины 25-35 лет, интересующиеся косметикой',
          budget: 5000,
          reward: 500,
          region: 'Москва',
          socialNetwork: 'INSTAGRAM',
          quantity: 10,
          maxExecutions: 10,
          completedCount: 7,
          status: 'IN_PROGRESS',
          customerId: customers[0].id,
          qrCode: nanoid(),
          qrCodeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Реклама онлайн-курса',
          description: 'Продвижение курса по программированию. Нужны посты с отзывами студентов и демонстрацией результатов.',
          targetAudience: 'Молодежь 18-30 лет, интересующаяся IT',
          budget: 8000,
          reward: 800,
          region: 'Санкт-Петербург',
          socialNetwork: 'VKONTAKTE',
          quantity: 15,
          maxExecutions: 15,
          completedCount: 12,
          status: 'IN_PROGRESS',
          customerId: customers[1].id,
          qrCode: nanoid(),
          qrCodeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Продвижение ресторана',
          description: 'Реклама нового ресторана с акцентом на уникальное меню и атмосферу. Нужны красивые фото блюд.',
          targetAudience: 'Люди 25-45 лет, любящие качественную еду',
          budget: 3000,
          reward: 300,
          region: 'Екатеринбург',
          socialNetwork: 'TELEGRAM',
          quantity: 5,
          maxExecutions: 5,
          completedCount: 5,
          status: 'COMPLETED',
          customerId: customers[0].id,
          qrCode: nanoid(),
          qrCodeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const orderData of testOrders) {
        try {
          const order = await prisma.order.create({
            data: orderData
          });
          console.log(`✅ Создан заказ: ${order.title}`);

          // Создаем выполнения для заказов
          const orderExecutors = executors.slice(0, Math.min(3, executors.length));
          for (let i = 0; i < orderData.completedCount; i++) {
            const executor = orderExecutors[i % orderExecutors.length];
            const executionStatus = i < orderData.completedCount ? 'COMPLETED' : 'PENDING';
            
            try {
              await prisma.execution.create({
                data: {
                  orderId: order.id,
                  executorId: executor.id,
                  status: executionStatus,
                  clicks: Math.floor(Math.random() * 50) + 10,
                  screenshotUrl: `/uploads/screenshots/test-${nanoid()}.jpg`,
                  completedAt: executionStatus === 'COMPLETED' ? new Date() : null
                }
              });
            } catch (error) {
              console.log(`⚠️ Выполнение уже существует для заказа ${order.title}`);
            }
          }
        } catch (error) {
          console.log(`⚠️ Заказ уже существует: ${orderData.title}`);
        }
      }
    }

    // Создаем тестовые платежи
    for (const user of createdUsers) {
      try {
        await prisma.payment.create({
          data: {
            userId: user.id,
            amount: user.balance,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            description: 'Тестовое пополнение баланса'
          }
        });
      } catch (error) {
        console.log(`⚠️ Платеж уже существует для пользователя ${user.name}`);
      }
    }

    // Создаем тестовые лимиты исполнителей
    for (const executor of executors) {
      try {
        await prisma.executorDailyLimit.create({
          data: {
            executorId: executor.id,
            socialNetwork: 'INSTAGRAM',
            dailyLimit: 5,
            usedToday: Math.floor(Math.random() * 3),
            resetDate: new Date()
          }
        });

        await prisma.executorDailyLimit.create({
          data: {
            executorId: executor.id,
            socialNetwork: 'VKONTAKTE',
            dailyLimit: 3,
            usedToday: Math.floor(Math.random() * 2),
            resetDate: new Date()
          }
        });
      } catch (error) {
        console.log(`⚠️ Лимиты уже существуют для исполнителя ${executor.name}`);
      }
    }

    console.log('🎉 Тестовые данные успешно созданы!');
    console.log('\n📋 Тестовые аккаунты:');
    console.log('👥 Исполнители:');
    executors.forEach(executor => {
      console.log(`  - ${executor.name}: ${executor.phone} / password123 (Баланс: ${executor.balance}₽)`);
    });
    console.log('\n💼 Заказчики:');
    customers.forEach(customer => {
      console.log(`  - ${customer.name}: ${customer.phone} / password123 (Баланс: ${customer.balance}₽)`);
    });

  } catch (error) {
    console.error('❌ Ошибка создания тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
