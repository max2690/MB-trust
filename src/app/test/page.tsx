'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface TestOrder {
  id: string;
  title: string;
  description: string;
  platform: string;
  quantity: number;
  pricePerStory: number;
  totalReward: number;
  status: string;
  createdAt: string;
  executions: any[];
}

export default function TestPage() {
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Форма создания тестового заказа
  const [formData, setFormData] = useState({
    platform: 'instagram',
    quantity: 1,
    pricePerStory: 100,
    description: '',
    title: 'Тестовый заказ'
  });

  useEffect(() => {
    fetchTestOrders();
  }, []);

  const fetchTestOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/orders');
      const data = await response.json();
      
      if (data.success) {
        setTestOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching test orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async () => {
    setCreatingOrder(true);
    try {
      const response = await fetch('/api/test/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Тестовый заказ создан!');
        fetchTestOrders(); // Обновляем список
        setFormData({
          platform: 'instagram',
          quantity: 1,
          pricePerStory: 100,
          description: '',
          title: 'Тестовый заказ'
        });
      } else {
        alert(data.error || 'Ошибка создания заказа');
      }
    } catch (error) {
      console.error('Error creating test order:', error);
      alert('Ошибка создания тестового заказа');
    } finally {
      setCreatingOrder(false);
    }
  };

  const acceptTestOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/test/orders/${orderId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Тестовый заказ принят!');
        fetchTestOrders(); // Обновляем список
      } else {
        alert(data.error || 'Ошибка принятия заказа');
      }
    } catch (error) {
      console.error('Error accepting test order:', error);
      alert('Ошибка принятия тестового заказа');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PENDING: { text: 'Ожидает', className: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { text: 'Выполняется', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { text: 'Завершен', className: 'bg-green-100 text-green-800' },
      CANCELLED: { text: 'Отменен', className: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🧪 Тестовый режим</h1>
        <p className="text-gray-600 mt-2">
          Создавайте и тестируйте заказы без списания реальных денег
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Создание тестового заказа */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Создать тестовый заказ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Название заказа</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Тестовый заказ"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Платформа</Label>
                <Select value={formData.platform} onValueChange={(value: string) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите платформу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="vk">VK</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Количество сторис</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Цена за сторис (₽)</Label>
                <Input
                  type="number"
                  min="50"
                  value={formData.pricePerStory}
                  onChange={(e) => setFormData({ ...formData, pricePerStory: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишите что нужно сделать..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Расчет стоимости:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Цена за сторис:</span>
                    <span>{formData.pricePerStory}₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Количество:</span>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Общая сумма:</span>
                    <span>{formData.pricePerStory * formData.quantity}₽</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Комиссия платформы (10%):</span>
                    <span>{(formData.pricePerStory * formData.quantity * 0.1).toFixed(0)}₽</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Исполнитель получит:</span>
                    <span>{(formData.pricePerStory * formData.quantity * 0.9).toFixed(0)}₽</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={createTestOrder}
                disabled={creatingOrder}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {creatingOrder ? 'Создаем...' : '🧪 Создать тестовый заказ'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Статистика тестов */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Статистика тестов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {testOrders.length}
                  </div>
                  <div className="text-sm text-blue-600">Создано заказов</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {testOrders.filter(order => order.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-green-600">Завершено</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {testOrders.reduce((sum, order) => sum + order.executions.length, 0)}
                </div>
                <div className="text-sm text-purple-600">AI проверок</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список тестовых заказов */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Тестовые заказы</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : testOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Тестовые заказы не найдены
            </div>
          ) : (
            <div className="space-y-4">
              {testOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{order.title}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Платформа:</span> {order.platform}
                    </div>
                    <div>
                      <span className="font-semibold">Количество:</span> {order.quantity} сторис
                    </div>
                    <div>
                      <span className="font-semibold">Цена:</span> {order.pricePerStory}₽ за сторис
                    </div>
                    <div>
                      <span className="font-semibold">Общая сумма:</span> {order.totalReward}₽
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    {order.status === 'PENDING' && (
                      <Button 
                        onClick={() => acceptTestOrder(order.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Принять заказ
                      </Button>
                    )}
                    
                    {order.status === 'IN_PROGRESS' && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/test/execute/${order.id}`}>
                          Выполнить заказ
                        </Link>
                      </Button>
                    )}
                    
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/test/orders/${order.id}`}>
                        Подробнее
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
