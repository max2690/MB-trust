'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface AdminStats {
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
  topUsers: {
    executors: Array<{ name: string; earnings: number; executions: number }>;
    customers: Array<{ name: string; spent: number; orders: number }>;
  };
}

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  level: string;
  region: string;
  balance: number;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  _count: {
    orders: number;
    executions: number;
  };
}

interface PlatformSettings {
  id: string;
  platform: string;
  basePrice: number;
  isActive: boolean;
}

interface CommissionSettings {
  id: string;
  level: string;
  executorRate: number;
  platformRate: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [platforms, setPlatforms] = useState<PlatformSettings[]>([]);
  const [commissions, setCommissions] = useState<CommissionSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, platformsRes] = await Promise.all([
        fetch('/api/admin/statistics'),
        fetch('/api/admin/users'),
        fetch('/api/admin/platforms')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      if (platformsRes.ok) {
        const platformsData = await platformsRes.json();
        setPlatforms(platformsData.platforms);
        setCommissions(platformsData.commissions);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformPrice = async (platformId: string, newPrice: number) => {
    try {
      const response = await fetch('/api/admin/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'platform',
          data: { platform: platformId, basePrice: newPrice }
        })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Ошибка обновления цены:', error);
    }
  };

  const handleUpdateCommission = async (level: string, executorRate: number, platformRate: number) => {
    try {
      const response = await fetch('/api/admin/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'commission',
          data: { level, executorRate, platformRate }
        })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Ошибка обновления комиссии:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <p className="text-white text-xl">Загрузка админ-панели...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Админ-панель MB-TRUST</h1>

        {/* Навигация */}
        <div className="flex space-x-4 mb-8">
          {['overview', 'users', 'platforms', 'commissions'].map(tab => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'primary' : 'outline'}
              className="capitalize"
            >
              {tab === 'overview' ? 'Обзор' : 
               tab === 'users' ? 'Пользователи' :
               tab === 'platforms' ? 'Платформы' : 'Комиссии'}
            </Button>
          ))}
        </div>

        {/* Обзор */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Основные метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.overview.totalUsers}</h3>
                <p className="text-mb-gray">Всего пользователей</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.overview.totalOrders}</h3>
                <p className="text-mb-gray">Всего заказов</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.overview.totalRevenue.toLocaleString()}₽</h3>
                <p className="text-mb-gray">Доход платформы</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-2xl font-bold text-mb-turquoise">{stats.overview.completionRate}%</h3>
                <p className="text-mb-gray">Процент выполнения</p>
              </Card>
            </div>

            {/* Статистика по ролям */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Пользователи по ролям</h3>
                <div className="space-y-2">
                  {stats.breakdown.usersByRole.map(item => (
                    <div key={item.role} className="flex justify-between">
                      <span className="text-mb-gray capitalize">{item.role}</span>
                      <Badge variant="gold">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Заказы по платформам</h3>
                <div className="space-y-2">
                  {stats.breakdown.ordersByPlatform.map(item => (
                    <div key={item.platform} className="flex justify-between">
                      <span className="text-mb-gray">{item.platform}</span>
                      <Badge variant="gold">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Топ пользователи */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Топ исполнители</h3>
                <div className="space-y-2">
                  {stats.topUsers.executors.slice(0, 5).map((executor) => (
                    <div key={executor.name} className="flex justify-between items-center">
                      <div>
                        <span className="text-white">{executor.name}</span>
                        <Badge variant="outline" className="ml-2">NOVICE</Badge>
                      </div>
                      <span className="text-mb-turquoise">{executor.executions} заказов</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Топ заказчики</h3>
                <div className="space-y-2">
                  {stats.topUsers.customers.slice(0, 5).map((customer) => (
                    <div key={customer.name} className="flex justify-between items-center">
                      <div>
                        <span className="text-white">{customer.name}</span>
                        <Badge variant="outline" className="ml-2">NOVICE</Badge>
                      </div>
                      <span className="text-mb-turquoise">{customer.orders} заказов</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Пользователи</h2>
              <Input
                placeholder="Поиск пользователей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-mb-gray/20">
                      <th className="text-left text-white p-2">Имя</th>
                      <th className="text-left text-white p-2">Роль</th>
                      <th className="text-left text-white p-2">Уровень</th>
                      <th className="text-left text-white p-2">Регион</th>
                      <th className="text-left text-white p-2">Баланс</th>
                      <th className="text-left text-white p-2">Заказы</th>
                      <th className="text-left text-white p-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-mb-gray/10">
                        <td className="p-2">
                          <div>
                            <div className="text-white">{user.name}</div>
                            <div className="text-mb-gray text-sm">{user.phone}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={user.role === 'CUSTOMER' ? 'default' : 'outline'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="gold">{user.level}</Badge>
                        </td>
                        <td className="p-2 text-mb-gray">{user.region}</td>
                        <td className="p-2 text-mb-turquoise">{user.balance}₽</td>
                        <td className="p-2 text-mb-gray">
                          {user._count?.orders || 0} / {user._count?.executions || 0}
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            {user.isVerified && <Badge variant="default">✓</Badge>}
                            {user.isBlocked && <Badge variant="destructive">Заблокирован</Badge>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Настройки платформ */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Настройки платформ</h2>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Цены за сторис</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map(platform => (
                  <div key={platform.id} className="flex items-center justify-between p-4 border border-mb-gray/20 rounded-lg">
                    <span className="text-white">{platform.platform}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={platform.basePrice}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value);
                          if (!isNaN(newPrice)) {
                            handleUpdatePlatformPrice(platform.platform, newPrice);
                          }
                        }}
                        className="w-20"
                      />
                      <span className="text-mb-gray">₽</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Настройки комиссий */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Настройки комиссий</h2>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Проценты по уровням</h3>
              <div className="space-y-4">
                {commissions.map(commission => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border border-mb-gray/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="gold">{commission.level}</Badge>
                      <span className="text-white">Исполнитель:</span>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={commission.executorRate}
                        onChange={(e) => {
                          const executorRate = parseFloat(e.target.value);
                          const platformRate = 1 - executorRate;
                          if (!isNaN(executorRate) && executorRate >= 0 && executorRate <= 1) {
                            handleUpdateCommission(commission.level, executorRate, platformRate);
                          }
                        }}
                        className="w-20"
                      />
                      <span className="text-mb-gray">({(commission.executorRate * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">Платформа:</span>
                      <span className="text-mb-turquoise">{(commission.platformRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}