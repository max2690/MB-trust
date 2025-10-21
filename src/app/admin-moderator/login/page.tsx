'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function AdminModeratorLoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStep, setVerificationStep] = useState<'login' | 'sms' | 'email'>('login');
  const [session, setSession] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [smsCode, setSmsCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState({
    sms: false,
    email: false
  });

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - любой логин/пароль проходит
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 DEV MODE: Автоматический вход без проверки');
      setTimeout(() => {
        router.push('/admin-moderator/dashboard');
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (data.success) {
        setSession(data.session);
        setAdmin(data.admin);
        setVerificationStep('sms');
        
        // Показываем статус отправки кодов
        if (data.verification.methods.length > 0) {
          console.log('Коды отправлены:', data.verification.methods);
        }
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (type: 'sms' | 'email') => {
    const code = type === 'sms' ? smsCode : emailCode;
    
    if (!code) {
      setError('Введите код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: session.token, 
          code, 
          type 
        })
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus(prev => ({ ...prev, [type]: true }));
        
        if (data.fullyVerified) {
          // Полная верификация завершена
          localStorage.setItem('adminToken', session.token);
          localStorage.setItem('adminRole', admin.role);
          router.push('/admin-moderator/dashboard');
        } else {
          // Переходим к следующему этапу
          if (type === 'sms' && !verificationStatus.email) {
            setVerificationStep('email');
          }
        }
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep === 'sms') {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">🔐 SMS Верификация</h1>
            <p className="text-mb-gray">
              Код отправлен на номер {admin?.phone}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="smsCode">SMS код</Label>
              <Input
                id="smsCode"
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="Введите код из SMS"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="text-mb-red text-sm text-center">{error}</div>
            )}

            <Button
              onClick={() => handleVerification('sms')}
              disabled={loading || !smsCode}
              className="w-full"
            >
              {loading ? 'Проверка...' : 'Подтвердить SMS'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (verificationStep === 'email') {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">📧 Email Верификация</h1>
            <p className="text-mb-gray">
              Код отправлен на {admin?.email}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="emailCode">Email код</Label>
              <Input
                id="emailCode"
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="Введите код из email"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="text-mb-red text-sm text-center">{error}</div>
            )}

            <Button
              onClick={() => handleVerification('email')}
              disabled={loading || !emailCode}
              className="w-full"
            >
              {loading ? 'Проверка...' : 'Подтвердить Email'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🟡 Модератор-Админ</h1>
          <p className="text-mb-gray">Вход в панель модератора</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <div className="text-mb-red text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading || !login || !password}
            className="w-full bg-mb-gold hover:bg-mb-gold/90"
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-mb-gray text-sm">
            Двойная верификация: SMS + Email
          </p>
        </div>
      </Card>
    </div>
  );
}

