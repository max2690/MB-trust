import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function deleteTestOrders() {
  try {
    console.log('🗑️  Удаление тестовых заданий...');
    
    // Находим и удаляем все тестовые заказы
    // Можно удалить по условию, например по customerId тестовых аккаунтов или по названию
    const testOrders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: { startsWith: 'test-' } },
          { title: { contains: 'Тест' } },
          { description: { contains: 'тест' } }
        ]
      },
      include: {
        executions: true
      }
    });

    console.log(`📋 Найдено ${testOrders.length} тестовых заказов`);

    // Удаляем выполнения сначала (из-за внешних ключей)
    for (const order of testOrders) {
      if (order.executions.length > 0) {
        await prisma.execution.deleteMany({
          where: { orderId: order.id }
        });
        console.log(`  ✅ Удалено ${order.executions.length} выполнений для заказа: ${order.title}`);
      }
    }

    // Удаляем заказы
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        OR: [
          { customerId: { startsWith: 'test-' } },
          { title: { contains: 'Тест' } },
          { description: { contains: 'тест' } }
        ]
      }
    });

    console.log(`✅ Удалено ${deletedOrders.count} тестовых заказов`);
    
    // Также можно удалить все заказы (если нужно полностью очистить)
    // const allOrders = await prisma.order.deleteMany({});
    // console.log(`✅ Удалено всех заказов: ${allOrders.count}`);
    
  } catch (error) {
    console.error('❌ Ошибка удаления тестовых заказов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestOrders();
