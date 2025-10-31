'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Wallet, AlertCircle } from 'lucide-react';

interface DepositFormProps {
  currentBalance: number;
  onDepositComplete: () => void;
  onClose: () => void;
}

const PAYMENT_AMOUNTS = [
  { amount: 500, label: '500₽' },
  { amount: 1000, label: '1 000₽' },
  { amount: 2000, label: '2 000₽' },
  { amount: 5000, label: '5 000₽' },
  { amount: 10000, label: '10 000₽' }
];

export function DepositForm({ currentBalance, onDepositComplete, onClose }: DepositFormProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'yookassa' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handleDeposit = async () => {
    const amount = getAmount();
    
    if (amount < 100) {
      setError('Минимальная сумма пополнения: 100₽');
      return;
    }
    
    if (amount > 100000) {
      setError('Максимальная сумма пополнения: 100 000₽');
      return;
    }

    if (!selectedProvider) {
      setError('Выберите способ оплаты');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Реальный API вызов будет здесь
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp-customer', // TODO: Из сессии
          amount: amount,
          provider: selectedProvider,
          orderId: null
        })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Перенаправляем на страницу оплаты
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      console.error('Ошибка пополнения:', error);
      setError(error instanceof Error ? error.message : 'Ошибка пополнения баланса');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl bg-gradient-to-br from-mb-black to-black">
        <CardHeader className="border-b border-mb-gray/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-mb-turquoise to-mb-gold bg-clip-text text-transparent">
                Пополнить баланс
              </CardTitle>
              <CardDescription className="text-mb-gray mt-1">
                Текущий баланс: <span className="text-mb-turquoise font-semibold">{currentBalance}₽</span>
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              className="text-mb-gray hover:text-mb-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Выбор суммы */}
          <div>
            <label className="block text-sm font-medium mb-3 text-mb-white">
              Сумма пополнения
            </label>
            
            {/* Быстрый выбор */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PAYMENT_AMOUNTS.map(({ amount, label }) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    selectedAmount === amount
                      ? 'border-mb-turquoise bg-mb-turquoise/10 text-mb-turquoise'
                      : 'border-mb-gray/20 bg-mb-black/50 text-mb-gray hover:border-mb-turquoise/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Кастомная сумма */}
            <Input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="Введите сумму"
              min={100}
              max={100000}
              className="w-full"
            />
            
            <p className="text-xs text-mb-gray mt-2">
              Минимум: 100₽, Максимум: 100 000₽
            </p>
          </div>

          {/* Итоговая сумма */}
          {getAmount() > 0 && (
            <div className="bg-mb-turquoise/10 border border-mb-turquoise/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-mb-gray">Сумма пополнения:</span>
                <span className="text-xl font-bold text-mb-turquoise">{getAmount()}₽</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-mb-gray">Новый баланс:</span>
                <span className="font-semibold text-mb-white">{(currentBalance + getAmount()).toLocaleString()}₽</span>
              </div>
            </div>
          )}

          {/* Способ оплаты */}
          <div>
            <label className="block text-sm font-medium mb-3 text-mb-white">
              Способ оплаты
            </label>
            
            <button
              onClick={() => setSelectedProvider('yookassa')}
              className={`w-full p-4 rounded-lg border transition-all ${
                selectedProvider === 'yookassa'
                  ? 'border-mb-turquoise bg-mb-turquoise/10'
                  : 'border-mb-gray/20 bg-mb-black/50 hover:border-mb-turquoise/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-mb-white">ЮKassa</div>
                    <div className="text-sm text-mb-gray">Банковская карта / СБП</div>
                  </div>
                </div>
                <div className="text-sm text-mb-gray">
                  Комиссия 2.9% + 15₽
                </div>
              </div>
            </button>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Кнопка пополнения */}
          <Button
            onClick={handleDeposit}
            disabled={isProcessing || getAmount() === 0 || !selectedProvider}
            className="w-full bg-gradient-to-r from-mb-turquoise to-mb-gold text-mb-black font-semibold hover:shadow-glow transition-all"
          >
            {isProcessing ? 'Обработка...' : `Пополнить ${getAmount()}₽`}
          </Button>

          {/* Мелкий шрифт */}
          <p className="text-xs text-center text-mb-gray/70">
            Нажимая &quot;Пополнить&quot;, вы соглашаетесь с условиями использования платформы
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

