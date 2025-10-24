'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrustLevel {
  id: string;
  name: string;
  displayName: string;
  minPricePerStory: number;
  commissionRate: number;
  minExecutions: number;
  minRating: number;
  minDaysActive: number;
  isActive: boolean;
}

export default function InitSystemPage() {
  const [trustLevels, setTrustLevels] = useState<TrustLevel[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const response = await fetch('/api/admin/init-trust-levels');
      const data = await response.json();
      
      if (data.success) {
        setInitialized(data.initialized);
        setTrustLevels(data.levels || []);
      }
    } catch (error) {
      console.error('Error checking initialization:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/admin/init-trust-levels', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Система успешно инициализирована!');
        setInitialized(true);
        setTrustLevels(data.levels);
      } else {
        alert(data.error || 'Ошибка инициализации');
      }
    } catch (error) {
      console.error('Error initializing system:', error);
      alert('Ошибка инициализации системы');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Проверка инициализации...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🚀 Инициализация системы</h1>
        <p className="text-gray-600 mt-2">
          Настройка базовых уровней доверия и параметров системы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Статус инициализации */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Статус системы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  initialized ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-semibold">
                  {initialized ? 'Система инициализирована' : 'Система не инициализирована'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                Уровней доверия: {trustLevels.length}
              </div>
              
              {!initialized && (
                <Button 
                  onClick={initializeSystem}
                  disabled={initializing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {initializing ? 'Инициализируем...' : '🚀 Инициализировать систему'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Уровни доверия */}
        <Card>
          <CardHeader>
            <CardTitle>👑 Уровни доверия</CardTitle>
          </CardHeader>
          <CardContent>
            {trustLevels.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Уровни не созданы
              </div>
            ) : (
              <div className="space-y-3">
                {trustLevels.map((level) => (
                  <div key={level.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{level.displayName}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        level.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Минимальная цена: {level.minPricePerStory}₽</div>
                      <div>Комиссия: {(level.commissionRate * 100).toFixed(0)}%</div>
                      <div>Минимум заданий: {level.minExecutions}</div>
                      <div>Минимальный рейтинг: {level.minRating}</div>
                      <div>Минимум дней: {level.minDaysActive}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Инструкции */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Инструкции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">После инициализации системы:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Перейдите в <strong>Уровни доверия</strong> для настройки параметров</li>
                <li>Используйте <strong>Активацию</strong> для создания QR-кодов пользователям</li>
                <li>Настройте <strong>Верификацию</strong> для самозанятых и Telegram Wallet</li>
                <li>Протестируйте систему через <strong>Тестовый режим</strong></li>
              </ol>
            </div>
            
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <a href="/admin-god/trust-levels" target="_blank">
                  👑 Уровни доверия
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/activation" target="_blank">
                  🎯 Активация
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/verification" target="_blank">
                  🔍 Верификация
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/test" target="_blank">
                  🧪 Тесты
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
