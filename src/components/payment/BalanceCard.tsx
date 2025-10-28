'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { DepositForm } from './DepositForm';
import { PayoutForm } from './PayoutForm';
import { useState } from 'react';

interface BalanceCardProps {
  balance: number;
  reservedBalance?: number;
  totalEarned?: number;
  role?: 'customer' | 'executor';
}

export function BalanceCard({ 
  balance = 0, 
  reservedBalance = 0, 
  totalEarned = 0,
  role = 'customer' 
}: BalanceCardProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showPayout, setShowPayout] = useState(false);

  const availableBalance = balance - reservedBalance;

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-mb-black via-mb-black to-mb-black/80 backdrop-blur-sm">
        <CardHeader className="border-b border-mb-gray/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-mb-turquoise to-mb-gold bg-clip-text text-transparent">
                {role === 'customer' ? 'Баланс заказчика' : 'Заработки'}
              </CardTitle>
              <CardDescription className="text-mb-gray">
                {role === 'customer' ? 'Управление бюджетом' : 'Управление выплатами'}
              </CardDescription>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-mb-turquoise to-mb-gold rounded-full flex items-center justify-center shadow-glow">
              <Wallet className="h-6 w-6 text-mb-black" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Основной баланс */}
          <div className="bg-gradient-to-br from-mb-turquoise/10 to-mb-gold/10 border border-mb-turquoise/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-mb-gray">
                {role === 'customer' ? 'Доступно' : 'Доступно к выводу'}
              </span>
              {role === 'executor' && (
                <span className="text-xs text-mb-turquoise bg-mb-turquoise/10 px-2 py-1 rounded">
                  Вывод в течение 1-3 часов
                </span>
              )}
            </div>
            <div className="text-4xl font-bold text-mb-white mb-1">
              {availableBalance.toLocaleString()}₽
            </div>
            {reservedBalance > 0 && (
              <div className="text-sm text-mb-gray">
                Зарезервировано: <span className="text-mb-white">{reservedBalance}₽</span>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-2 gap-3">
            {role === 'customer' && (
              <Button
                onClick={() => setShowDeposit(true)}
                className="bg-gradient-to-r from-mb-turquoise to-mb-gold text-mb-black font-semibold hover:shadow-glow transition-all"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Пополнить
              </Button>
            )}
            
            {role === 'executor' && (
              <Button
                onClick={() => setShowPayout(true)}
                disabled={availableBalance < 500}
                className="bg-gradient-to-r from-mb-gold to-mb-turquoise text-mb-black font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Вывести
              </Button>
            )}
            
            <Button
              variant="outline"
              className="border-mb-gray/20 hover:border-mb-turquoise/50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              История
            </Button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-mb-gray/20">
            <div>
              <p className="text-sm text-mb-gray mb-1">Общий баланс</p>
              <p className="text-lg font-semibold text-mb-white">{balance.toLocaleString()}₽</p>
            </div>
            <div>
              <p className="text-sm text-mb-gray mb-1">
                {role === 'customer' ? 'Всего пополнено' : 'Всего заработано'}
              </p>
              <p className="text-lg font-semibold text-mb-gold">{totalEarned.toLocaleString()}₽</p>
            </div>
          </div>

          {/* Плейсхолдер для будущих графиков */}
          {role === 'customer' && (
            <div className="pt-4 border-t border-mb-gray/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-mb-gray">Активных заказов:</span>
                <span className="text-mb-white font-semibold">0</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальные окна */}
      {showDeposit && (
        <DepositForm
          currentBalance={balance}
          onDepositComplete={() => {
            setShowDeposit(false);
            // TODO: Обновить данные
          }}
          onClose={() => setShowDeposit(false)}
        />
      )}

      {showPayout && (
        <PayoutForm
          currentBalance={balance}
          availableBalance={availableBalance}
          onPayoutComplete={() => {
            setShowPayout(false);
            // TODO: Обновить данные
          }}
          onClose={() => setShowPayout(false)}
          telegramWalletVerified={true} // TODO: Из базы
        />
      )}
    </>
  );
}

