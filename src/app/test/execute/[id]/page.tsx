'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TestOrder {
  id: string;
  title: string;
  description: string;
  platform: string;
  quantity: number;
  pricePerStory: number;
  totalReward: number;
  status: string;
  executions: any[];
}

interface AIResult {
  confidence: number;
  approved: boolean;
  details: {
    qrCodeDetected: boolean;
    platformMatch: boolean;
    qualityScore: number;
  };
  message: string;
}

export default function TestExecutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [order, setOrder] = useState<TestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/test/orders/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      } else {
        alert(data.error || 'Ошибка получения заказа');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Ошибка получения заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setScreenshots(prev => {
          const newScreenshots = [...prev];
          newScreenshots[currentStep] = result;
          return newScreenshots;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitScreenshot = async () => {
    if (!screenshots[currentStep]) {
      alert('Загрузите скриншот');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/test/verify-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshot: screenshots[currentStep],
          orderId: id,
          stepNumber: currentStep
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAiResults(prev => {
          const newResults = [...prev];
          newResults[currentStep] = data.result;
          return newResults;
        });

        if (data.result.approved) {
          alert('✅ Скриншот одобрен!');
          if (currentStep < (order?.quantity || 1) - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            alert('🎉 Все скриншоты выполнены! Заказ завершен!');
          }
        } else {
          alert('❌ Скриншот отклонен. Попробуйте еще раз.');
        }
      } else {
        alert(data.error || 'Ошибка проверки скриншота');
      }
    } catch (error) {
      console.error('Error submitting screenshot:', error);
      alert('Ошибка проверки скриншота');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Загрузка заказа...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">Заказ не найден</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-blue-800 font-semibold">
          🧪 ТЕСТОВОЕ ВЫПОЛНЕНИЕ ЗАКАЗА
        </h2>
        <p className="text-blue-700 text-sm">
          Загружайте тестовые скриншоты для проверки AI
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-6">📱 Выполнение заказа #{order.id}</h1>

      {/* Информация о заказе */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📋 Информация о заказе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-semibold">Название:</span> {order.title}
            </div>
            <div>
              <span className="font-semibold">Платформа:</span> {order.platform}
            </div>
            <div>
              <span className="font-semibold">Количество сторис:</span> {order.quantity}
            </div>
            <div>
              <span className="font-semibold">Цена за сторис:</span> {order.pricePerStory}₽
            </div>
            <div>
              <span className="font-semibold">Общая сумма:</span> {order.totalReward}₽
            </div>
            <div>
              <span className="font-semibold">Статус:</span> {order.status}
            </div>
          </div>
          
          {order.description && (
            <div className="mt-4">
              <span className="font-semibold">Описание:</span>
              <p className="mt-1 text-gray-700">{order.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Прогресс выполнения */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 Прогресс выполнения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            {Array.from({ length: order.quantity }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Прогресс: {currentStep}/{order.quantity} сторис
          </p>
        </CardContent>
      </Card>

      {/* Загрузка скриншота */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📸 Загрузка скриншота #{currentStep + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Скриншот сторис #{currentStep + 1}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="mt-1"
              />
            </div>
            
            {screenshots[currentStep] && (
              <div className="space-y-4">
                <div>
                  <img 
                    src={screenshots[currentStep]} 
                    alt={`Скриншот ${currentStep + 1}`}
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={submitScreenshot}
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? 'Проверяем...' : '✅ Отправить на проверку'}
                  </Button>
                  
                  {currentStep < order.quantity - 1 && (
                    <Button 
                      onClick={() => setCurrentStep(currentStep + 1)}
                      variant="outline"
                    >
                      ➡️ Следующий скриншот
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Результаты проверки */}
      {aiResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🤖 Результаты AI проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Скриншот #{index + 1}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.approved ? '✅ Одобрен' : '❌ Отклонен'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>Уверенность AI: {(result.confidence * 100).toFixed(1)}%</div>
                    <div>QR-код обнаружен: {result.details.qrCodeDetected ? '✅' : '❌'}</div>
                    <div>Соответствие платформе: {result.details.platformMatch ? '✅' : '❌'}</div>
                    <div>Качество изображения: {result.details.qualityScore.toFixed(2)}</div>
                    <div className="mt-2 text-gray-600">{result.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
