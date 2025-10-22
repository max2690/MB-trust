"use client";

import type { Order as PrismaOrder } from '@prisma/client';
import type { OrderUI } from '@/lib/ui-types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

type Order = OrderUI;
interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  compact?: boolean;
}

export function OrderCard({ order, onAccept, compact = false }: OrderCardProps) {
  return (
    <Card className="hover:shadow-glow transition-all duration-300">
      <div className={`flex ${compact ? 'items-center' : 'items-start'} justify-between mb-4`}>
        <div>
          <h3 className="text-lg font-semibold text-white">{order.title}</h3>
          {!compact && <p className="text-mb-gray">{order.description}</p>}
          <p className="text-sm text-mb-turquoise mt-1">
            Целевая аудитория: {order.targetAudience}
          </p>
          <p className="text-sm text-mb-gray mt-1">
            Заказчик: {order.customer?.name} ({order.customer?.level})
          </p>
    </div>
  <Badge variant="gold">{Number(order.totalReward ?? order.reward ?? 0).toLocaleString()}₽</Badge>
      </div>
      
      {/* Готовое изображение с QR кодом */}
      <div className={`text-center ${compact ? 'mb-2' : 'mb-4'}`}>
        <h4 className="text-sm font-medium mb-2 text-white">Готовое изображение для размещения:</h4>
        {order.processedImageUrl ? (
          <img 
            src={order.processedImageUrl} 
            alt={order.title ? `Изображение заказа: ${order.title}` : 'Готовое изображение'} 
            className={`mx-auto max-w-full object-cover rounded border-2 border-mb-turquoise ${compact ? 'h-28' : 'h-48'}`} 
          />
        ) : (
          <div className="text-mb-gray">Нет подготовленного изображения</div>
        )}
        <p className="text-xs text-mb-gray mt-2">
          Просто скопируйте это изображение в вашу сторис
        </p>
      </div>
      
      {/* QR код отдельно (если нужен) */}
      <div className="text-center mb-4">
        <h4 className="text-sm font-medium mb-2 text-white">QR код отдельно:</h4>
        {order.qrCodeUrl ? (
          <img src={order.qrCodeUrl} alt="QR Code" className="mx-auto w-24 h-24" />
        ) : (
          <div className="text-mb-gray">QR код не готов</div>
        )}
      </div>
      
      {/* Требования */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 text-white">Требования:</h4>
        <ul className="text-sm text-mb-gray space-y-1">
          <li>• Разместить в сторис Instagram/Telegram</li>
          <li>• Сделать скриншот размещения</li>
          <li>• Загрузить скриншот для проверки</li>
        </ul>
      </div>

      {/* Срок выполнения */}
      <div className="mb-4">
          <p className="text-sm text-mb-gray">
          Срок выполнения: {order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
        </p>
      </div>
      
      {/* Кнопка принять */}
      <Button 
        onClick={() => onAccept(order.id)}
        className="w-full"
      >
        Принять заказ
      </Button>
    </Card>
  );
}

