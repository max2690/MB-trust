'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatisticsCharts } from '@/components/analytics/StatisticsCharts';

interface StatisticsData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalExecutions: number;
    totalRevenue: number;
    activeUsers: number;
    completedOrders: number;
    completionRate: string;
  };
  breakdown: {
    usersByRole: Array<{ role: string; count: number }>;
    usersByLevel: Array<{ level: string; count: number }>;
    ordersByPlatform: Array<{ platform: string; count: number }>;
    usersByRegion: Array<{ region: string; count: number }>;
  };
  dynamics: Array<{ date: string; users: number; orders: number; revenue: number }>;
  topUsers: {
    executors: Array<{ name: string; earnings: number; executions: number }>;
    customers: Array<{ name: string; spent: number; orders: number }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Ошибка загрузки статистики');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mb-turquoise mx-auto mb-4"></div>
          <p className="text-white text-xl">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-mb-red mb-4">Ошибка</h2>
          <p className="text-mb-gray mb-4">{error}</p>
          <Button onClick={fetchStatistics} variant="outline">
            Попробовать снова
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <p className="text-white text-xl">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mb-turquoise">📊 Аналитика платформы</h1>
            <p className="text-mb-gray">Детальная статистика и графики</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={fetchStatistics} variant="outline">
              🔄 Обновить
            </Button>
            <Button variant="outline">
              📤 Экспорт
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <StatisticsCharts data={data} />

        {/* Дополнительная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Ключевые метрики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-mb-gray">Конверсия заказов:</span>
                <span className="text-mb-turquoise font-bold">{data.overview.completionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mb-gray">Средний чек:</span>
                <span className="text-mb-gold font-bold">
                  {data.overview.totalOrders > 0 
                    ? Math.round(data.overview.totalRevenue / data.overview.totalOrders).toLocaleString() 
                    : 0}₽
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mb-gray">Активность пользователей:</span>
                <span className="text-mb-turquoise font-bold">
                  {data.overview.totalUsers > 0 
                    ? Math.round((data.overview.activeUsers / data.overview.totalUsers) * 100) 
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Топ исполнители</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topUsers.executors.slice(0, 3).map((executor, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-mb-black/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{executor.name}</p>
                      <p className="text-mb-gray text-sm">{executor.executions} выполнений</p>
                    </div>
                    <div className="text-right">
                      <p className="text-mb-gold font-bold">{executor.earnings.toLocaleString()}₽</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}