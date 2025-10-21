'use client';

import { useState, useEffect } from 'react';
import { CreateOrderForm } from '@/components/business/CreateOrderForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Order {
  id: string;
  title: string;
  description: string;
  budget: number;
  reward: number;
  status: string;
  processedImageUrl: string;
  qrCodeUrl: string;
  createdAt: string;
  executions: any[];
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
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
      <div className="container mx-auto px-4 py-8">
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
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">{orders.length}</h3>
            <p className="text-mb-gray">Всего заказов</p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">
              {orders.filter(o => o.status === 'PENDING').length}
            </h3>
            <p className="text-mb-gray">Ожидают</p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">
              {orders.filter(o => o.status === 'IN_PROGRESS').length}
            </h3>
            <p className="text-mb-gray">В работе</p>
          </Card>
          <Card className="p-6 text-center">
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
            <Card className="p-8 text-center">
              <p className="text-mb-gray text-lg">У вас пока нет заказов</p>
              <p className="text-mb-gray">Создайте первый заказ, чтобы начать работу</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{order.title}</h3>
                      <p className="text-mb-gray mt-1">{order.description}</p>
                      <p className="text-sm text-mb-turquoise mt-2">
                        Бюджет: {order.budget}₽ | Исполнителю: {order.reward}₽
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status === 'PENDING' ? 'Ожидает' :
                         order.status === 'IN_PROGRESS' ? 'В работе' :
                         order.status === 'COMPLETED' ? 'Завершен' : order.status}
                      </span>
                    </div>
                  </div>

                  {/* Изображения */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <h4 className="text-sm font-medium mb-2 text-white">Готовое изображение:</h4>
                      <img 
                        src={order.processedImageUrl} 
                        alt="Processed" 
                        className="mx-auto max-w-full h-32 object-cover rounded border border-mb-turquoise" 
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium mb-2 text-white">QR код:</h4>
                      <img 
                        src={order.qrCodeUrl} 
                        alt="QR Code" 
                        className="mx-auto w-24 h-24" 
                      />
                    </div>
                  </div>

                  {/* Выполнения */}
                  {order.executions && order.executions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 text-white">Выполнения:</h4>
                      <div className="space-y-2">
                        {order.executions.map((execution: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-mb-input rounded">
                            <div>
                              <p className="text-white text-sm">Исполнитель: {execution.executor?.name || 'Неизвестно'}</p>
                              <p className="text-mb-gray text-xs">Статус: {execution.status}</p>
                            </div>
                            <span className="text-mb-turquoise text-sm">{execution.reward}₽</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-mb-gray mt-4">
                    Создан: {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
