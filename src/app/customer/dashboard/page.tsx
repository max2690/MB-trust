'use client';

import { useState, useEffect } from 'react';
import { CreateOrderForm } from '@/components/business/CreateOrderForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container'
import { OrderCard } from '@/components/business/OrderCard'
import Link from 'next/link';

import type { OrderUI } from '@/lib/ui-types';

type OrderWithTotals = OrderUI;

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<OrderWithTotals[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?role=customer&userId=temp-customer');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          customerId: 'temp-customer'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Заказ успешно создан!');
        setShowCreateForm(false);
        fetchOrders(); // Обновляем список заказов
      } else {
        alert('Ошибка создания заказа');
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка создания заказа');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black">
      <Container className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Дашборд заказчика</h1>
          <div className="flex space-x-4">
            <Link href="/customer/advanced-orders">
              <Button variant="outline">
                Расширенные заказы
              </Button>
            </Link>
            <Link href="/customer/refunds">
              <Button variant="outline">
                Возвраты
              </Button>
            </Link>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-mb-turquoise hover:bg-mb-turquoise/90"
            >
              {showCreateForm ? 'Отменить' : 'Создать заказ'}
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CreateOrderForm onSubmit={handleCreateOrder} />
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">{orders.length}</h3>
            <p className="text-mb-gray">Всего заказов</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">
              {orders.filter(o => o.status === 'PENDING').length}
            </h3>
            <p className="text-mb-gray">Ожидают</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">
              {orders.filter(o => o.status === 'IN_PROGRESS').length}
            </h3>
            <p className="text-mb-gray">В работе</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </h3>
            <p className="text-mb-gray">Завершены</p>
          </Card>
        </div>

        {/* Список заказов */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Мои заказы</h2>
          
          {orders.length === 0 ? (
            <Card className="text-center">
              <p className="text-mb-gray text-lg">У вас пока нет заказов</p>
              <p className="text-mb-gray">Создайте первый заказ, чтобы начать работу</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onAccept={() => {}} compact />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
