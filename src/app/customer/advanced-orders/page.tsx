'use client';

import { useState } from 'react';
import { AdvancedOrderForm } from '@/components/business/AdvancedOrderForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdvancedOrdersPage() {
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);

  const handleOrderSubmit = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          customerId: 'temp-customer' // TODO: Заменить на реальный ID пользователя
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCreatedOrders(prev => [...prev, data.orders]);
        alert(`Заказ успешно создан! Стоимость: ${orderData.totalCost.toLocaleString()}₽`);
      } else {
        alert(`Ошибка создания заказа: ${data.error}`);
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Произошла ошибка при создании заказа');
    }
  };

  return (
    <div className="min-h-screen bg-mb-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Расширенные заказы</h1>
          
          <div className="mb-8">
            <Card className="p-6 bg-mb-gray/10">
              <h2 className="text-xl font-bold text-white mb-4">Возможности расширенных заказов</h2>
              <ul className="space-y-2 text-mb-gray">
                <li>• Создание кампаний на несколько платформ одновременно</li>
                <li>• Недельные и двухнедельные кампании</li>
                <li>• Автоматическое или ручное распределение по дням</li>
                <li>• Встроенный калькулятор стоимости</li>
                <li>• Автоматический возврат денег через 72 часа при невыполнении</li>
                <li>• Гибкое планирование публикаций</li>
              </ul>
            </Card>
          </div>

          <AdvancedOrderForm onSubmit={handleOrderSubmit} />

          {/* Созданные заказы */}
          {createdOrders.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Созданные заказы</h2>
              <div className="space-y-4">
                {createdOrders.map((orderGroup, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Группа заказов #{index + 1}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(orderGroup) ? orderGroup.map((order: any) => (
                        <div key={order.id} className="p-4 border border-mb-gray/20 rounded">
                          <div className="text-white font-medium">{order.title}</div>
                          <div className="text-mb-gray text-sm">ID: {order.id}</div>
                          <div className="text-mb-turquoise">Общая сумма: {order.totalReward ?? order.reward ?? 0}₽</div>
                          <div className="text-mb-gold">Вознаграждение: {order.reward}₽</div>
                        </div>
                      )) : (
                        <div className="p-4 border border-mb-gray/20 rounded">
                          <div className="text-white font-medium">{orderGroup.title}</div>
                          <div className="text-mb-gray text-sm">ID: {orderGroup.id}</div>
                          <div className="text-mb-turquoise">Общая сумма: {orderGroup.totalReward ?? orderGroup.reward ?? 0}₽</div>
                          <div className="text-mb-gold">Вознаграждение: {orderGroup.reward}₽</div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

