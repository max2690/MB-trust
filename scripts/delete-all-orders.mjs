import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function deleteAllOrders() {
  try {
    console.log('🧹 Начинаем удаление ВСЕХ заказов...\n');
    
    // 1. Сначала удаляем все выполнения (из-за внешних ключей)
    console.log('📋 Шаг 1: Удаление всех выполнений...');
    const deletedExecutions = await prisma.execution.deleteMany({});
    console.log(`   ✅ Удалено выполнений: ${deletedExecutions.count}\n`);
    
    // 2. Удаляем ВСЕ заказы без исключений
    console.log('📦 Шаг 2: Удаление ВСЕХ заказов...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ Удалено заказов: ${deletedOrders.count}\n`);
    
    // 3. Проверяем, какие пользователи остались и их заказы
    console.log('👤 Шаг 3: Проверка пользователей...');
    const allUsers = await prisma.user.findMany({
      where: {
        id: {
          not: 'admin-god'
        }
      },
      include: {
        orders: true
      }
    });
    
    console.log(`   Найдено пользователей: ${allUsers.length}`);
    for (const user of allUsers) {
      console.log(`   - ${user.name} (${user.email || user.phone}): ${user.orders.length} заказов`);
    }
    
    console.log('\n✨ Удаление всех заказов завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка удаления:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllOrders();






