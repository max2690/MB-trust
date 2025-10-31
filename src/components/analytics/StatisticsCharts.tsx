'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface StatisticsChartsProps {
  data: {
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
  };
}

const COLORS = ['#00D4FF', '#00E1B4', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
type PieLbl = { x?: number; y?: number; name?: string; value?: number; percent?: number };

export function StatisticsCharts({ data }: StatisticsChartsProps) {
  // Подготавливаем данные для диаграмм
  const roleData = data.breakdown.usersByRole.map(item => ({
    name: item.role === 'CUSTOMER' ? 'Заказчики' : 'Исполнители',
    value: item.count,
    fill: item.role === 'CUSTOMER' ? '#00D4FF' : '#00E1B4'
  }));

  const levelData = data.breakdown.usersByLevel.map(item => ({
    name: item.level,
    value: item.count
  }));

  const platformData = data.breakdown.ordersByPlatform.map(item => ({
    name: item.platform,
    value: item.count
  }));

  const regionData = data.breakdown.usersByRegion.map(item => ({
    name: item.region,
    value: item.count
  }));

  const executorData = data.topUsers.executors.map(item => ({
    name: item.name,
    earnings: item.earnings,
    executions: item.executions
  }));

  const customerData = data.topUsers.customers.map(item => ({
    name: item.name,
    spent: item.spent,
    orders: item.orders
  }));

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mb-gray">Всего пользователей</p>
              <p className="text-2xl font-bold text-white">{data.overview.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mb-gray">Всего заказов</p>
              <p className="text-2xl font-bold text-white">{data.overview.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mb-gray">Выполнений</p>
              <p className="text-2xl font-bold text-white">{data.overview.totalExecutions}</p>
            </div>
            <div className="w-12 h-12 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mb-gray">Доход платформы</p>
              <p className="text-2xl font-bold text-mb-gold">{data.overview.totalRevenue.toLocaleString()}₽</p>
            </div>
            <div className="w-12 h-12 bg-mb-gold/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Диаграммы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение по ролям */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Распределение пользователей по ролям</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLbl) => `${props.name ?? ''} ${(((props.percent ?? 0) * 100).toFixed(0))}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Распределение по уровням */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Пользователи по уровням</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="value" fill="#00D4FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Заказы по платформам */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Заказы по платформам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="value" fill="#00E1B4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Пользователи по регионам */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Пользователи по регионам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="value" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Топ исполнители и заказчики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ исполнители */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Топ исполнители по заработку</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="earnings" fill="#00D4FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Топ заказчики */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Топ заказчики по тратам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="spent" fill="#00E1B4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Динамика */}
      {data.dynamics.length > 0 && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Динамика платформы</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data.dynamics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.6} />
                <Area type="monotone" dataKey="orders" stackId="1" stroke="#00E1B4" fill="#00E1B4" fillOpacity={0.6} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
