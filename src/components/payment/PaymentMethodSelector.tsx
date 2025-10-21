'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PAYMENT_PROVIDERS } from '@/lib/payment-providers';

interface PaymentMethodSelectorProps {
  amount: number;
  onPaymentCreated: (paymentUrl: string) => void;
}

export function PaymentMethodSelector({ amount, onPaymentCreated }: PaymentMethodSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreatePayment = async () => {
    if (!selectedProvider) return;

    setLoading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Получим из контекста
          amount,
          provider: selectedProvider
        })
      });

      const data = await response.json();
      if (data.success) {
        onPaymentCreated(data.payment.paymentUrl);
      }
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = (provider: string) => {
    const providerData = PAYMENT_PROVIDERS[provider];
    return Math.round(amount * providerData.commission / 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-mb-turquoise">Выберите способ оплаты</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PAYMENT_PROVIDERS).map(([key, provider]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all ${
              selectedProvider === key 
                ? 'ring-2 ring-mb-turquoise bg-mb-turquoise/10' 
                : 'hover:bg-gray-800'
            }`}
            onClick={() => setSelectedProvider(key)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{provider.logo}</span>
                <div>
                  <div className="text-lg">{provider.name}</div>
                  <div className="text-sm text-mb-gray">
                    Комиссия: {provider.commission}%
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Сумма:</span>
                  <span>{amount}₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Комиссия:</span>
                  <span>{calculateCommission(key)}₽</span>
                </div>
                <div className="flex justify-between font-semibold text-mb-turquoise">
                  <span>Итого:</span>
                  <span>{amount + calculateCommission(key)}₽</span>
                </div>
                <div className="text-xs text-mb-gray">
                  Время: {provider.processingTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={handleCreatePayment}
        disabled={!selectedProvider || loading}
        className="w-full"
      >
        {loading ? 'Создание платежа...' : 'Перейти к оплате'}
      </Button>
    </div>
  );
}
