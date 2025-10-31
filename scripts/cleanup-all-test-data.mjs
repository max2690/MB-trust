import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function cleanupAllTestData() {
  try {
    console.log('🧹 Начинаем полную очистку всех тестовых данных...\n');
    
    // 1. Удаляем все выполнения
    console.log('📋 Шаг 1: Удаление всех выполнений...');
    const deletedExecutions = await prisma.execution.deleteMany({});
    console.log(`   ✅ Удалено выполнений: ${deletedExecutions.count}\n`);
    
    // 2. Удаляем все заказы
    console.log('📦 Шаг 2: Удаление всех заказов...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ Удалено заказов: ${deletedOrders.count}\n`);
    
    // 3. Удаляем платежи
    console.log('💳 Шаг 3: Удаление платежей...');
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✅ Удалено платежей: ${deletedPayments.count}\n`);
    
    // 4. Удаляем связанные данные пользователей
    console.log('🔗 Шаг 4: Удаление связанных данных пользователей...');
    
    // Удаляем Referrals
    const deletedReferrals = await prisma.referral.deleteMany({});
    console.log(`   ✅ Удалено рефералов: ${deletedReferrals.count}`);
    
    // Удаляем ExecutorDailyLimit
    const deletedDailyLimits = await prisma.executorDailyLimit.deleteMany({});
    console.log(`   ✅ Удалено лимитов: ${deletedDailyLimits.count}`);
    
    // Удаляем Refunds
    const deletedRefunds = await prisma.refund.deleteMany({});
    console.log(`   ✅ Удалено возвратов: ${deletedRefunds.count}`);
    
    // Удаляем ActivationStory
    const deletedStories = await prisma.activationStory.deleteMany({});
    console.log(`   ✅ Удалено историй активации: ${deletedStories.count}`);
    
    // Удаляем Payouts
    const deletedPayouts = await prisma.payout.deleteMany({});
    console.log(`   ✅ Удалено выплат: ${deletedPayouts.count}`);
    
    // Удаляем TelegramVerification
    const deletedTelegramVerifications = await prisma.telegramVerification.deleteMany({});
    console.log(`   ✅ Удалено верификаций Telegram: ${deletedTelegramVerifications.count}\n`);
    
    // 5. Удаляем всех тестовых пользователей (кроме суперадмина)
    console.log('👤 Шаг 5: Удаление тестовых пользователей...');
    const testUsers = await prisma.user.findMany({
      where: {
        id: {
          not: 'admin-god' // Сохраняем суперадмина
        },
        OR: [
          { id: { startsWith: 'test-' } },
          { email: { contains: '@test' } },
          { phone: { contains: '+7-999' } },
          { phone: { contains: '+7 (999)' } },
          { name: { contains: 'Тест' } },
          { email: { contains: 'customer-test' } },
          { email: { contains: 'executor-test' } }
        ]
      }
    });
    
    for (const user of testUsers) {
      // Удаляем пользователя (все связанные данные уже удалены выше)
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`   ✅ Удален тестовый пользователь: ${user.name} (${user.email || user.phone})`);
    }
    console.log(`   Всего удалено тестовых пользователей: ${testUsers.length}\n`);
    
    // 6. Удаляем недавно зарегистрированных (за последние 7 дней)
    console.log('📅 Шаг 6: Удаление недавно зарегистрированных пользователей...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        id: {
          not: 'admin-god'
        }
      }
    });
    
    for (const user of recentUsers) {
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`   ✅ Удален недавний пользователь: ${user.name} (${user.email || user.phone}) - создан ${user.createdAt.toLocaleDateString('ru-RU')}`);
    }
    console.log(`   Всего удалено недавних пользователей: ${recentUsers.length}\n`);
    
    console.log('✨ Полная очистка завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка очистки:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllTestData();
