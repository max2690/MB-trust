export interface PaymentProvider {
  name: string;
  logo: string;
  commission: number; // % комиссии
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  isActive: boolean;
}

export const PAYMENT_PROVIDERS: Record<string, PaymentProvider> = {
  yookassa: {
    name: 'ЮKassa',
    logo: '🏦',
    commission: 2.9, // 2.9% + 15₽
    minAmount: 100,
    maxAmount: 1000000,
    processingTime: 'Мгновенно',
    isActive: true
  },
  alfa: {
    name: 'Альфа-Банк',
    logo: '🏛️',
    commission: 2.5, // 2.5% + 10₽
    minAmount: 100,
    maxAmount: 500000,
    processingTime: '1-3 минуты',
    isActive: true
  }
};

// Заглушки для URL (заменим на реальные)
export const PAYMENT_URLS = {
  yookassa: {
    create: 'https://api.yookassa.ru/v3/payments', // ЗАГЛУШКА
    webhook: '/api/payments/yookassa/webhook',
    success: '/api/payments/yookassa/success',
    cancel: '/api/payments/yookassa/cancel'
  },
  alfa: {
    create: 'https://pay.alfabank.ru/payment/rest/register.do', // ЗАГЛУШКА
    webhook: '/api/payments/alfa/webhook',
    success: '/api/payments/alfa/success',
    cancel: '/api/payments/alfa/cancel'
  }
};
