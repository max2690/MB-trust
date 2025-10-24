'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Bot, Smartphone } from 'lucide-react';

interface TelegramVerification {
  telegramUsername: string;
  isVerified: boolean;
  storiesMonitored: number;
  storiesApproved: number;
  lastStoryCheck: string | null;
}

export default function TelegramVerificationPage() {
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState<TelegramVerification | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Получаем текущий статус мониторинга
  useEffect(() => {
    fetchMonitoringStatus();
  }, []);

  const fetchMonitoringStatus = async () => {
    try {
      const response = await fetch('/api/verification/telegram-monitor?userId=test-user-id');
      const data = await response.json();
      
      if (data.success) {
        setMonitoring(data.monitoring);
        if (data.verification) {
          setVerification(data.verification);
        }
      }
    } catch (error) {
      console.error('Error fetching monitoring status:', error);
    }
  };

  const startMonitoring = async () => {
    if (!telegramUsername.trim()) {
      setError('Введите Telegram username');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/verification/telegram-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id', // В реальности будет ID текущего пользователя
          telegramUsername: telegramUsername.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Мониторинг Telegram аккаунта запущен! 🤖');
        setMonitoring(true);
        setVerification(data.verification);
        
        // Обновляем статус каждые 5 секунд
        const interval = setInterval(fetchMonitoringStatus, 5000);
        setTimeout(() => clearInterval(interval), 60000); // Останавливаем через минуту
      } else {
        setError(data.error || 'Ошибка запуска мониторинга');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verification/telegram-monitor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Мониторинг остановлен');
        setMonitoring(false);
        setVerification(null);
      } else {
        setError(data.error || 'Ошибка остановки мониторинга');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 Telegram Мониторинг</h1>
        <p className="text-gray-600">
          Автоматическая проверка ваших сторис через Telegram Bot
        </p>
      </div>

      <div className="grid gap-6">
        {/* Статус мониторинга */}
        {verification && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Статус мониторинга
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {verification.telegramUsername}
                  </div>
                  <div className="text-sm text-gray-500">Username</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {verification.storiesMonitored}
                  </div>
                  <div className="text-sm text-gray-500">Проверено</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {verification.storiesApproved}
                  </div>
                  <div className="text-sm text-gray-500">Одобрено</div>
                </div>
                
                <div className="text-center">
                  <Badge variant={verification.isVerified ? "default" : "secondary"}>
                    {verification.isVerified ? (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Верифицирован</>
                    ) : (
                      <><Clock className="h-4 w-4 mr-1" /> В процессе</>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Настройка мониторинга */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {monitoring ? 'Управление мониторингом' : 'Настройка мониторинга'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!monitoring ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="telegram-username">Telegram Username</Label>
                  <Input
                    id="telegram-username"
                    placeholder="@username"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Как это работает:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Введите ваш Telegram username</li>
                      <li>Бот начнет мониторить ваши сторис</li>
                      <li>При размещении сторис автоматически проверяется</li>
                      <li>Вы получаете уведомления о результатах</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={startMonitoring} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Запуск...' : '🚀 Начать мониторинг'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Мониторинг активен для {verification?.telegramUsername}. 
                    Бот автоматически проверяет ваши новые сторис.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={stopMonitoring} 
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? 'Остановка...' : '⏹️ Остановить мониторинг'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Преимущества */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Преимущества Telegram мониторинга</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ Автоматизация</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 100% автоматическая проверка</li>
                  <li>• Мгновенные результаты</li>
                  <li>• Никаких скриншотов</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">🎯 Точность</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Анализ оригинальных сторис</li>
                  <li>• Нет потери качества</li>
                  <li>• Реальное время</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">📱 Удобство</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Все через Telegram</li>
                  <li>• Уведомления в реальном времени</li>
                  <li>• Простота использования</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600">🤖 AI Анализ</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Проверка QR-кодов</li>
                  <li>• Анализ качества контента</li>
                  <li>• Соответствие заданию</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Сообщения */}
      {message && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
