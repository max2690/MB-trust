"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/business/OrderCard';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const found = data.orders.find((o: any) => o.id === id);
          if (found) {
            setOrder(found);
            setExecutions(found.executions || []);
          } else if (data.orders && data.orders.id) {
            // sometimes API returns single object
            const single = data.orders;
            if (single.id === id) {
              setOrder(single);
              setExecutions(single.executions || []);
            }
          }
        } else if (data.orders && data.orders.id) {
          const single = data.orders;
          if (single.id === id) {
            setOrder(single);
            setExecutions(single.executions || []);
          }
        }
      } catch (err) {
        setError('Ошибка загрузки заказа');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <p className="text-white">Загрузка...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <Container>
        <div className="py-8">
          <Button variant="ghost" onClick={() => router.back()}>&larr; Назад</Button>
          <h2 className="text-2xl font-bold text-white mt-4">Заказ не найден</h2>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>&larr; Назад</Button>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Информация о заказе</h2>
          <OrderCard order={order} onAccept={() => {}} compact />
        </Card>

        {/* Executions */}
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Выполнения</h3>
          {executions.length === 0 ? (
            <p className="text-mb-gray">Нет выполнений</p>
          ) : (
            <div className="space-y-4">
              {executions.map((exec) => (
                <OrderCard key={exec.id} order={{ ...order, ...exec }} onAccept={() => {}} compact />
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-white">Действия</h3>
          <div className="flex space-x-4">
            <Button onClick={() => alert('Принять')}>Принять</Button>
            <Button variant="outline" onClick={() => alert('Отклонить')}>Отклонить</Button>
          </div>
        </Card>

        {error && <div className="mt-6 text-mb-red">{error}</div>}
      </div>
    </Container>
  );
}
