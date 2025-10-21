'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Refund {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  processedAt: string | null;
  createdAt: string;
  order: {
    title: string;
    socialNetwork: string;
    deadline: string;
  };
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/refunds?customerId=temp-customer'); // TODO: Заменить на реальный ID
      const data = await response.json();
      
      if (data.success) {
        setRefunds(data.refunds);
      }
    } catch (error) {
      console.error('Ошибка загрузки возвратов:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (orderId: string) => {
    try {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          customerId: 'temp-customer', // TODO: Заменить на реальный ID
          reason: 'Заказ не выполнен в срок'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Запрос на возврат создан!');
        fetchRefunds();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Ошибка создания возврата:', error);
      alert('Произошла ошибка при создании запроса на возврат');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Ожидает</Badge>;
      case 'PROCESSING':
        return <Badge variant="default">Обрабатывается</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">Завершен</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Ошибка</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline">Отменен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <p className="text-white text-xl">Загрузка возвратов...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Возвраты</h1>

        {/* Информация о возвратах */}
        <Card className="p-6 mb-8 bg-mb-gray/10">
          <h2 className="text-xl font-bold text-white mb-4">Как работает система возвратов</h2>
          <div className="space-y-2 text-mb-gray">
            <p>• Возврат денег возможен только если заказ не выполнен в срок</p>
            <p>• Запрос на возврат можно подать через 72 часа после дедлайна заказа</p>
            <p>• Деньги автоматически возвращаются на ваш баланс</p>
            <p>• Возврат обрабатывается в течение 24 часов</p>
          </div>
        </Card>

        {/* Список возвратов */}
        {refunds.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-mb-gray">У вас пока нет возвратов</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {refunds.map(refund => (
              <Card key={refund.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{refund.order.title}</h3>
                    <p className="text-mb-gray text-sm">
                      Заказ #{refund.orderId} • {refund.order.socialNetwork}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-mb-turquoise text-lg font-bold">{refund.amount}₽</div>
                    {getStatusBadge(refund.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-mb-gray">Причина:</span>
                    <p className="text-white">{refund.reason}</p>
                  </div>
                  <div>
                    <span className="text-mb-gray">Дедлайн заказа:</span>
                    <p className="text-white">{new Date(refund.order.deadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-mb-gray">Дата запроса:</span>
                    <p className="text-white">{new Date(refund.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {refund.processedAt && (
                  <div className="mt-4 p-3 bg-mb-gray/10 rounded">
                    <span className="text-mb-gray text-sm">Обработан:</span>
                    <p className="text-white">{new Date(refund.processedAt).toLocaleString()}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Кнопка для тестирования */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => requestRefund('test-order-id')}
            variant="outline"
            className="text-mb-gray"
          >
            Тест: Создать возврат (для разработки)
          </Button>
        </div>
      </div>
    </div>
  );
}

