'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Container from '@/components/ui/container';
import { OrderCard } from '@/components/business/OrderCard';

interface Admin {
  id: string;
  login: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  telegramId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

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

export default function AdminGodDashboard() {
  // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - прямой доступ в dev режиме
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 DEV MODE: Прямой доступ к админ панели без авторизации');
  }

  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showBlockUsers, setShowBlockUsers] = useState(false);
  const [showBalanceTest, setShowBalanceTest] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState('');
  const [balanceTestUser, setBalanceTestUser] = useState('');
  const [balanceTestAmount, setBalanceTestAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    login: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    telegramId: '',
    role: 'MODERATOR_ADMIN'
  });

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - пропускаем проверку авторизации
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 DEV MODE: Пропускаем проверку авторизации в dashboard');
      setAdmin({
        id: 'dev-admin-id',
        login: 'dev-admin',
        name: 'Dev Super Admin',
        role: 'SUPER_ADMIN',
        phone: '89241242417',
        email: 'shveddamir@gmail.com',
        isActive: true
      });
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-god/login');
      return;
    }

    try {
      const response = await fetch(`/api/admin/auth/session?token=${token}`);
      const data = await response.json();

      if (data.success && data.admin.role === 'SUPER_ADMIN') {
        setAdmin(data.admin);
      } else {
        localStorage.removeItem('adminToken');
        router.push('/admin-god/login');
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      router.push('/admin-god/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, adminsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/admins')
      ]);

      const usersData = await usersRes.json();
      const adminsData = await adminsRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (adminsData.success) setAdmins(adminsData.admins);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAdmin,
          createdBy: admin?.login,
          permissions: ['users', 'orders', 'payments', 'moderation']
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateAdmin(false);
        setNewAdmin({
          login: '',
          password: '',
          name: '',
          phone: '',
          email: '',
          telegramId: '',
          role: 'MODERATOR_ADMIN'
        });
        fetchData();
      } else {
        setError(data.error || 'Ошибка создания админа');
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
    router.push('/admin-god/login');
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
      <Container>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mb-red">🔴 Админ-Бог Панель</h1>
            <p className="text-mb-gray">Добро пожаловать, {admin?.name}</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => window.open('/admin/analytics', '_blank')} variant="outline">
              📊 Аналитика
            </Button>
            <Button onClick={() => window.open('/admin-god/trust-levels', '_blank')} variant="outline">
              👑 Уровни доверия
            </Button>
            <Button onClick={() => window.open('/activation', '_blank')} variant="outline">
              🎯 Активация
            </Button>
            <Button onClick={() => window.open('/verification', '_blank')} variant="outline">
              🔍 Верификация
            </Button>
            <Button onClick={() => window.open('/verification/telegram', '_blank')} variant="outline">
              🤖 Telegram
            </Button>
            <Button onClick={() => window.open('/init', '_blank')} variant="outline">
              🚀 Инициализация
            </Button>
            <Button onClick={() => setShowCreateAdmin(true)} variant="outline">
              Создать модератора
            </Button>
            <Button onClick={() => setShowBlockUsers(true)} variant="outline">
              Блокировать пользователей
            </Button>
            <Button onClick={() => setShowBalanceTest(true)} variant="outline">
              💰 Тест пополнения
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Выйти
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">{users.length}</h3>
            <p className="text-mb-gray">Всего пользователей</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-gold">{admins.length}</h3>
            <p className="text-mb-gray">Администраторов</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-turquoise">
              {users.filter(u => u.isVerified).length}
            </h3>
            <p className="text-mb-gray">Верифицированных</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-red">
              {users.filter(u => u.isBlocked).length}
            </h3>
            <p className="text-mb-gray">Заблокированных</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-2xl font-bold text-mb-gold">50,000₽</h3>
            <p className="text-mb-gray">Баланс админа</p>
          </Card>
        </div>

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Создать модератора-админа</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="login">Логин</Label>
                  <Input
                    id="login"
                    value={newAdmin.login}
                    onChange={(e) => setNewAdmin({ ...newAdmin, login: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telegramId">Telegram ID</Label>
                  <Input
                    id="telegramId"
                    value={newAdmin.telegramId}
                    onChange={(e) => setNewAdmin({ ...newAdmin, telegramId: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  Создать
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateAdmin(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Balance Test Modal */}
        {showBalanceTest && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Тест пополнения баланса</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="balanceUser">ID пользователя</Label>
                <Input
                  id="balanceUser"
                  value={balanceTestUser}
                  onChange={(e) => setBalanceTestUser(e.target.value)}
                  placeholder="Введите ID пользователя"
                />
              </div>
              <div>
                <Label htmlFor="balanceAmount">Сумма пополнения</Label>
                <Input
                  id="balanceAmount"
                  type="number"
                  value={balanceTestAmount}
                  onChange={(e) => setBalanceTestAmount(e.target.value)}
                  placeholder="Введите сумму"
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={async () => {
                  try {
                    // Получаем текущий баланс пользователя
                    const userResponse = await fetch(`/api/admin/users?id=${balanceTestUser}`);
                    const userData = await userResponse.json();
                    
                    if (!userData.success) {
                      alert('Пользователь не найден');
                      return;
                    }
                    
                    const currentBalance = userData.user.balance || 0;
                    const newBalance = currentBalance + parseFloat(balanceTestAmount);
                    
                    const response = await fetch('/api/admin/users', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: balanceTestUser,
                        updates: { balance: newBalance }
                      })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      alert(`Баланс успешно пополнен на ${balanceTestAmount}₽\nНовый баланс: ${newBalance}₽`);
                      setShowBalanceTest(false);
                      setBalanceTestUser('');
                      setBalanceTestAmount('');
                      fetchData();
                    } else {
                      alert(data.error || 'Ошибка пополнения баланса');
                    }
                  } catch (err) {
                    console.error('Error:', err);
                    alert('Ошибка сети');
                  }
                }} disabled={!balanceTestUser || !balanceTestAmount}>
                  Пополнить баланс
                </Button>
                <Button variant="outline" onClick={() => setShowBalanceTest(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Block Users Modal */}
        {showBlockUsers && (
          <Card className="mb-8">
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

        {/* Admins Table */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Администраторы</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Логин</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний вход</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.login}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'SUPER_ADMIN' ? 'destructive' : 'default'}>
                      {admin.role === 'SUPER_ADMIN' ? 'Бог' : 'Модератор'}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.phone || '-'}</TableCell>
                  <TableCell>{admin.email || '-'}</TableCell>
                  <TableCell>{admin.telegramId || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                      {admin.isActive ? 'Активен' : 'Заблокирован'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Никогда'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Users Table */}
        <Card>
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
      </Container>
    </div>
  );
}

