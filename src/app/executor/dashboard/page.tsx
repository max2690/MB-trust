'use client';

import { useState, useEffect } from 'react';
import { OrderCard } from '@/components/business/OrderCard';
import { ScreenshotUpload } from '@/components/business/ScreenshotUpload';
import { ExecutorLimits } from '@/components/business/ExecutorLimits';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  budget: number;
  reward: number;
  processedImageUrl: string;
  qrCodeUrl: string;
  deadline: string;
  customer: {
    name: string;
    level: string;
  };
}

interface Execution {
  id: string;
  orderId: string;
  status: string;
  reward: number;
  createdAt: string;
  order: {
    title: string;
    description: string;
    reward: number;
    status: string;
  };
}

export default function ExecutorDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myExecutions, setMyExecutions] = useState<Execution[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    earnings: 0,
    completed: 0,
    rating: 4.8
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Загружаем доступные заказы
      const ordersResponse = await fetch('/api/orders?role=executor');
      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        setAvailableOrders(ordersData.orders);
      }

      // Загружаем мои выполнения
      const executionsResponse = await fetch('/api/executions?executorId=temp-executor');
      const executionsData = await executionsResponse.json();
      if (executionsData.success) {
        setMyExecutions(executionsData.executions);
        
        // Подсчитываем статистику
        const completed = executionsData.executions.filter((e: Execution) => e.status === 'COMPLETED').length;
        const earnings = executionsData.executions
          .filter((e: Execution) => e.status === 'COMPLETED')
          .reduce((sum: number, e: Execution) => sum + e.reward, 0);
        
        setStats({
          earnings,
          completed,
          rating: 4.8
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          executorId: 'temp-executor'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Заказ принят! Теперь загрузите скриншот выполнения.');
        setSelectedOrder(availableOrders.find(o => o.id === orderId) || null);
        fetchData(); // Обновляем данные
      } else {
        alert('Ошибка принятия заказа');
      }
    } catch (error) {
      console.error('Ошибка принятия заказа:', error);
      alert('Ошибка принятия заказа');
    }
  };

  const handleScreenshotUpload = async (file: File, orderId: string, executorId: string) => {
    try {
      // Сначала загружаем файл
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('orderId', orderId);
      formData.append('executorId', executorId);

      const uploadResponse = await fetch('/api/executions/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();
      
      if (uploadData.success) {
        // Затем обновляем выполнение
        const updateResponse = await fetch('/api/executions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            executorId: 'temp-executor',
            screenshotUrl: uploadData.screenshotUrl,
            status: 'PENDING_REVIEW'
          }),
        });

        if (updateResponse.ok) {
          alert('Скриншот загружен! Ожидайте проверки.');
          setSelectedOrder(null);
          fetchData(); // Обновляем данные
        } else {
          alert('Ошибка обновления выполнения');
        }
      } else {
        alert('Ошибка загрузки скриншота');
      }
    } catch (error) {
      console.error('Ошибка загрузки скриншота:', error);
      alert('Ошибка загрузки скриншота');
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
        <h1 className="text-3xl font-bold text-white mb-8">Дашборд исполнителя</h1>

            {/* Статистика и лимиты */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.earnings}₽</h3>
                <p className="text-mb-gray">Заработано</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.completed}</h3>
                <p className="text-mb-gray">Выполнено</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.rating}</h3>
                <p className="text-mb-gray">Рейтинг</p>
              </Card>
              <ExecutorLimits executorId="temp-executor" />
            </div>

        {/* Загрузка скриншота для выбранного заказа */}
        {selectedOrder && (
          <div className="mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Загрузите скриншот для заказа: {selectedOrder.title}
              </h2>
              <ScreenshotUpload 
                orderId={selectedOrder.id}
                executorId="temp-executor"
                onUpload={handleScreenshotUpload}
              />
              <Button 
                onClick={() => setSelectedOrder(null)}
                variant="outline"
                className="mt-4"
              >
                Отменить
              </Button>
            </Card>
          </div>
        )}

        {/* Доступные заказы */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Доступные заказы</h2>
          {availableOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-mb-gray text-lg">Нет доступных заказов</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {availableOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAccept={handleAcceptOrder}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Мои выполнения */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Мои выполнения</h2>
          {myExecutions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-mb-gray text-lg">У вас пока нет выполненных заказов</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myExecutions.map(execution => (
                <Card key={execution.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{execution.order.title}</h3>
                      <p className="text-mb-gray text-sm">{execution.order.description}</p>
                      <p className="text-mb-gray text-xs mt-1">
                        Статус: {execution.status === 'PENDING' ? 'Ожидает' :
                                execution.status === 'PENDING_REVIEW' ? 'На проверке' :
                                execution.status === 'COMPLETED' ? 'Завершен' : execution.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-mb-turquoise font-semibold">{execution.reward}₽</span>
                      <p className="text-mb-gray text-xs">
                        {new Date(execution.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
