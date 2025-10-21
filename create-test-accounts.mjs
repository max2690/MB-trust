import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db"
    }
  }
});

async function createTestAccounts() {
  try {
    console.log('Создаем тестовые аккаунты...');

    // Создаем заказчика
    const customer = await prisma.user.upsert({
      where: { phone: '+7-999-000-0001' },
      update: {},
      create: {
        id: 'test-customer-1',
        name: 'Тестовый Заказчик',
        email: 'customer-test@mb-trust.com',
        phone: '+7-999-000-0001',
        passwordHash: await bcrypt.hash('password123', 10),
        country: 'Россия',
        region: 'Москва',
        role: 'CUSTOMER',
        level: 'VERIFIED',
        balance: 10000,
        isVerified: true,
        isBlocked: false
      }
    });

    // Создаем исполнителя
    const executor = await prisma.user.upsert({
      where: { phone: '+7-999-000-0002' },
      update: {},
      create: {
        id: 'test-executor-1',
        name: 'Тестовый Исполнитель',
        email: 'executor-test@mb-trust.com',
        phone: '+7-999-000-0002',
        passwordHash: await bcrypt.hash('password123', 10),
        country: 'Россия',
        region: 'Санкт-Петербург',
        role: 'EXECUTOR',
        level: 'VERIFIED',
        balance: 0,
        isVerified: true,
        isBlocked: false
      }
    });

    console.log('✅ Тестовые аккаунты созданы:');
    console.log('👤 Заказчик:', customer.name, customer.phone);
    console.log('👤 Исполнитель:', executor.name, executor.phone);
    console.log('🔑 Пароль для обоих: password123');

  } catch (error) {
    console.error('❌ Ошибка создания аккаунтов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccounts();