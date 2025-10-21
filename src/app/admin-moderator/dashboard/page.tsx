'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  level: string;
  balance: number;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

interface PlatformSetting {
  id: string;
  platform: string;
  basePrice: number;
  isActive: boolean;
}

interface CommissionSetting {
  id: string;
  level: string;
  executorRate: number;
  platformRate: number;
}

export default function AdminModeratorDashboard() {
  // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - прямой доступ в dev режиме
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 DEV MODE: Прямой доступ к модератор панели без авторизации');
  }

  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [platforms, setPlatforms] = useState<PlatformSetting[]>([]);
  const [commissions, setCommissions] = useState<CommissionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModerator, setShowCreateModerator] = useState(false);
  const [showBlockUsers, setShowBlockUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState('');
  const [newModerator, setNewModerator] = useState({
    login: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    telegramId: ''
  });

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - пропускаем проверку авторизации
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 DEV MODE: Пропускаем проверку авторизации в moderator dashboard');
      setAdmin({
        id: 'dev-moderator-id',
        login: 'dev-moderator',
        name: 'Dev Moderator Admin',
        role: 'MODERATOR_ADMIN',
        phone: '89241242417',
        email: 'shveddamir@gmail.com',
        isActive: true
      });
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-moderator/login');
      return;
    }

    try {
      const response = await fetch(`/api/admin/auth/session?token=${token}`);
      const data = await response.json();

      if (data.success && data.admin.role === 'MODERATOR_ADMIN') {
        setAdmin(data.admin);
      } else {
        localStorage.removeItem('adminToken');
        router.push('/admin-moderator/login');
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      router.push('/admin-moderator/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, platformsRes, commissionsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/platforms'),
        fetch('/api/admin/commissions')
      ]);

      const usersData = await usersRes.json();
      const platformsData = await platformsRes.json();
      const commissionsData = await commissionsRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (platformsData.success) setPlatforms(platformsData.platforms);
      if (commissionsData.success) setCommissions(commissionsData.commissions);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformPrice = async (id: string, newPrice: number) => {
    try {
      const response = await fetch('/api/admin/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, basePrice: newPrice }),
      });
      const data = await response.json();
      if (data.success) {
        setError('');
        fetchData();
      } else {
        setError(data.error || 'Ошибка обновления цены');
      }
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  const handleUpdateCommissionRate = async (level: string, newRate: number) => {
    try {
      const response = await fetch('/api/admin/commissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, executorRate: newRate, platformRate: 1 - newRate }),
      });
      const data = await response.json();
      if (data.success) {
        setError('');
        fetchData();
      } else {
        setError(data.error || 'Ошибка обновления комиссии');
      }
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  const handleCreateModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newModerator,
          role: 'MODERATOR_ADMIN',
          createdBy: admin?.login,
          permissions: ['users', 'orders', 'moderation']
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModerator(false);
        setNewModerator({
          login: '',
          password: '',
          name: '',
          phone: '',
          email: '',
          telegramId: ''
        });
        alert('Модератор успешно создан!');
      } else {
        setError(data.error || 'Ошибка создания модератора');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUsers = async (isBlocked: boolean) => {
    try {
      const response = await fetch('/api/admin/block-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          isBlocked,
          reason: blockReason,
          blockedBy: admin?.login
        })
      });

      if (response.ok) {
        setSelectedUsers([]);
        setBlockReason('');
        setShowBlockUsers(false);
        fetchData();
        alert(`${isBlocked ? 'Заблокировано' : 'Разблокировано'} ${selectedUsers.length} пользователей`);
      } else {
        const error = await response.json();
        setError(error.error || 'Ошибка блокировки');
      }
    } catch (error) {
      setError('Ошибка блокировки пользователей');
    }
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin-moderator/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <p className="text-white text-xl">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mb-gold">🟡 Модератор-Админ Панель</h1>
            <p className="text-mb-gray">Добро пожаловать, {admin?.name}</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => window.open('/admin/analytics', '_blank')} variant="outline">
              📊 Аналитика
            </Button>
            <Button onClick={() => setShowCreateModerator(true)} variant="outline">
              Создать модератора
            </Button>
            <Button onClick={() => setShowBlockUsers(true)} variant="outline">
              Блокировать пользователей
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Выйти
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">{users.length}</h3>
            <p className="text-mb-gray">Всего пользователей</p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-gold">
              {users.filter(u => u.isVerified).length}
            </h3>
            <p className="text-mb-gray">Верифицированных</p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-red">
              {users.filter(u => u.isBlocked).length}
            </h3>
            <p className="text-mb-gray">Заблокированных</p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-bold text-mb-gold">25,000₽</h3>
            <p className="text-mb-gray">Баланс модератора</p>
          </Card>
        </div>

        {/* Create Moderator Modal */}
        {showCreateModerator && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Создать модератора</h2>
            <form onSubmit={handleCreateModerator}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="login">Логин</Label>
                  <Input
                    id="login"
                    value={newModerator.login}
                    onChange={(e) => setNewModerator({ ...newModerator, login: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newModerator.password}
                    onChange={(e) => setNewModerator({ ...newModerator, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={newModerator.name}
                    onChange={(e) => setNewModerator({ ...newModerator, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={newModerator.phone}
                    onChange={(e) => setNewModerator({ ...newModerator, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newModerator.email}
                    onChange={(e) => setNewModerator({ ...newModerator, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telegramId">Telegram ID</Label>
                  <Input
                    id="telegramId"
                    value={newModerator.telegramId}
                    onChange={(e) => setNewModerator({ ...newModerator, telegramId: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  Создать
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModerator(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Block Users Modal */}
        {showBlockUsers && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Блокировка пользователей</h2>
            <div className="mb-4">
              <Label htmlFor="blockReason">Причина блокировки</Label>
              <Input
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Укажите причину блокировки"
              />
            </div>
            <div className="mb-4">
              <p className="text-sm text-mb-gray mb-2">
                Выбрано пользователей: {selectedUsers.length}
              </p>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={() => handleBlockUsers(true)} 
                variant="destructive"
                disabled={selectedUsers.length === 0}
              >
                Заблокировать выбранных
              </Button>
              <Button 
                onClick={() => handleBlockUsers(false)} 
                variant="outline"
                disabled={selectedUsers.length === 0}
              >
                Разблокировать выбранных
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowBlockUsers(false)}>
                Отмена
              </Button>
            </div>
          </Card>
        )}

        {/* Platform Settings */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Настройки платформ</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Платформа</TableHead>
                <TableHead>Базовая цена (₽)</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell>{platform.platform}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={platform.basePrice}
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value);
                        if (!isNaN(newPrice)) {
                          setPlatforms(prev => prev.map(p => p.id === platform.id ? { ...p, basePrice: newPrice } : p));
                        }
                      }}
                      className="w-24 inline-block mr-2"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={platform.isActive ? 'default' : 'secondary'}>
                      {platform.isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleUpdatePlatformPrice(platform.id, platform.basePrice)}>
                      Сохранить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Commission Settings */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Настройки комиссий</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Уровень</TableHead>
                <TableHead>Исполнителю (%)</TableHead>
                <TableHead>Платформе (%)</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{commission.level}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={commission.executorRate}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value);
                        if (!isNaN(newRate)) {
                          setCommissions(prev => prev.map(c => c.id === commission.id ? { ...c, executorRate: newRate, platformRate: 1 - newRate } : c));
                        }
                      }}
                      className="w-24 inline-block mr-2"
                    />
                  </TableCell>
                  <TableCell>{(commission.platformRate * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <Button onClick={() => handleUpdateCommissionRate(commission.level, commission.executorRate)}>
                      Сохранить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Пользователи</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Регистрация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleToggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'CUSTOMER' ? 'default' : 'gold'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.level}</Badge>
                  </TableCell>
                  <TableCell>{user.balance}₽</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                        {user.isVerified ? 'Верифицирован' : 'Не верифицирован'}
                      </Badge>
                      {user.isBlocked && (
                        <Badge variant="destructive">Заблокирован</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {error && (
          <div className="fixed bottom-4 right-4 bg-mb-red text-white p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

