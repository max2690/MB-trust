'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Bot, CreditCard, Wallet } from 'lucide-react';

interface VerificationStatus {
  selfEmployed: {
    verified: boolean;
    innNumber?: string;
    status: string;
    verifiedAt?: string;
  };
  telegramWallet: {
    verified: boolean;
    walletId?: string;
    verifiedAt?: string;
  };
  preferredPayoutMethod: string;
}

export default function VerificationPage() {
  const [userId, setUserId] = useState('');
  const [innNumber, setInnNumber] = useState('');
  const [telegramUserId, setTelegramUserId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkVerificationStatus = async () => {
    if (!userId) {
      alert('Введите ID пользователя');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/verification/status?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setVerificationStatus(data.verification);
      } else {
        alert(data.error || 'Ошибка получения статуса верификации');
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      alert('Ошибка получения статуса верификации');
    } finally {
      setLoading(false);
    }
  };

  const verifySelfEmployed = async () => {
    if (!userId || !innNumber) {
      alert('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verification/nalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ innNumber, userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Статус самозанятого подтвержден!');
        checkVerificationStatus(); // Обновляем статус
      } else {
        alert(data.message || 'Ошибка верификации');
      }
    } catch (error) {
      console.error('Error verifying self-employed:', error);
      alert('Ошибка верификации статуса самозанятого');
    } finally {
      setLoading(false);
    }
  };

  const verifyTelegramWallet = async () => {
    if (!userId || !telegramUserId) {
      alert('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verification/telegram-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramUserId, userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Telegram Wallet верифицирован!');
        checkVerificationStatus(); // Обновляем статус
      } else {
        alert(data.message || 'Ошибка верификации');
      }
    } catch (error) {
      console.error('Error verifying Telegram Wallet:', error);
      alert('Ошибка верификации Telegram Wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🔍 Верификация для выплат</h1>
        <p className="text-gray-600 mt-2">
          Верифицируйте статус самозанятого и Telegram Wallet для получения выплат
        </p>
      </div>

      {/* Telegram Мониторинг */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bot className="h-5 w-5" />
            🤖 Telegram Мониторинг (НОВОЕ!)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-blue-600 font-medium">
              Автоматическая проверка ваших сторис через Telegram Bot
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>100% автоматизация</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Мгновенные результаты</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Никаких скриншотов</span>
              </div>
            </div>
            <Link href="/verification/telegram">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Bot className="h-4 w-4 mr-2" />
                Настроить Telegram мониторинг
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Поиск пользователя */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>👤 Поиск пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>ID пользователя</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Введите ID пользователя"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={checkVerificationStatus}
                disabled={!userId || loading}
              >
                {loading ? 'Проверяем...' : '🔍 Проверить статус'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статус верификации */}
      {verificationStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Статус самозанятого */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏦 Банк СПБ (самозанятые)</span>
                <div className={`w-3 h-3 rounded-full ${
                  verificationStatus.selfEmployed.verified ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Статус:</span> 
                  <span className={`ml-2 ${
                    verificationStatus.selfEmployed.verified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationStatus.selfEmployed.verified ? '✅ Подтвержден' : '❌ Не подтвержден'}
                  </span>
                </div>
                
                {verificationStatus.selfEmployed.innNumber && (
                  <div className="text-sm">
                    <span className="font-semibold">ИНН:</span> 
                    <span className="ml-2">{verificationStatus.selfEmployed.innNumber}</span>
                  </div>
                )}
                
                {verificationStatus.selfEmployed.verifiedAt && (
                  <div className="text-sm">
                    <span className="font-semibold">Дата верификации:</span> 
                    <span className="ml-2">{new Date(verificationStatus.selfEmployed.verifiedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Статус Telegram Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🤖 Telegram Wallet</span>
                <div className={`w-3 h-3 rounded-full ${
                  verificationStatus.telegramWallet.verified ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Статус:</span> 
                  <span className={`ml-2 ${
                    verificationStatus.telegramWallet.verified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationStatus.telegramWallet.verified ? '✅ Подтвержден' : '❌ Не подтвержден'}
                  </span>
                </div>
                
                {verificationStatus.telegramWallet.walletId && (
                  <div className="text-sm">
                    <span className="font-semibold">Wallet ID:</span> 
                    <span className="ml-2">{verificationStatus.telegramWallet.walletId}</span>
                  </div>
                )}
                
                {verificationStatus.telegramWallet.verifiedAt && (
                  <div className="text-sm">
                    <span className="font-semibold">Дата верификации:</span> 
                    <span className="ml-2">{new Date(verificationStatus.telegramWallet.verifiedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Верификация самозанятого */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🏦 Верификация самозанятого</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>ИНН самозанятого</Label>
              <Input
                value={innNumber}
                onChange={(e) => setInnNumber(e.target.value)}
                placeholder="Введите 12-значный ИНН"
                className="mt-1"
                maxLength={12}
              />
              <p className="text-sm text-gray-600 mt-1">
                ИНН должен быть 12-значным числом
              </p>
            </div>
            
            <Button 
              onClick={verifySelfEmployed}
              disabled={!userId || !innNumber || loading}
              className="w-full"
            >
              {loading ? 'Проверяем...' : '🔍 Проверить статус самозанятого'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Верификация Telegram Wallet */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 Верификация Telegram Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Telegram User ID</Label>
              <Input
                value={telegramUserId}
                onChange={(e) => setTelegramUserId(e.target.value)}
                placeholder="Введите Telegram User ID"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Для получения User ID обратитесь к @userinfobot в Telegram
              </p>
            </div>
            
            <Button 
              onClick={verifyTelegramWallet}
              disabled={!userId || !telegramUserId || loading}
              className="w-full"
            >
              {loading ? 'Проверяем...' : '🔍 Верифицировать Telegram Wallet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
