'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Автоматически перенаправляем через 5 секунд
    const timer = setTimeout(() => {
      router.push('/customer/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-mb-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-6xl mb-4">✅</div>
          <CardTitle className="text-2xl text-mb-turquoise">
            Платеж успешно выполнен!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-mb-gray">
            Ваш баланс пополнен. Средства поступят в течение нескольких минут.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/customer/dashboard')}
              className="w-full"
            >
              Перейти в личный кабинет
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              На главную
            </Button>
          </div>
          <p className="text-xs text-mb-gray">
            Автоматическое перенаправление через 5 секунд...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
