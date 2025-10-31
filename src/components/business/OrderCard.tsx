"use client";

import type { Order as PrismaOrder } from '@prisma/client';
import type { OrderUI } from '@/lib/ui-types';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

type Order = OrderUI;
interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  compact?: boolean;
  hideAcceptButton?: boolean; // Скрыть кнопку "Принять заказ" для заказчиков
  showScreenshotUpload?: boolean; // Показать окно загрузки скриншота для исполнителей
  onScreenshotUpload?: (file: File, orderId: string) => void; // Callback для загрузки скриншота
}

export function OrderCard({ order, onAccept, compact = false, hideAcceptButton = false, showScreenshotUpload = false, onScreenshotUpload }: OrderCardProps) {
  return (
    <Card className="hover:shadow-glow transition-all duration-300">
      <div className={`flex ${compact ? 'items-center' : 'items-start'} justify-between gap-3 mb-4`}>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white leading-tight">{order.title}</h3>
          {!compact && order.description && (
            <p className="text-mb-gray mt-2">{order.description}</p>
          )}
          {/* TODO: Добавить поле linkUrl в схему Order, если нужно */}
          {/* {order.linkUrl && (
            <a
              href={order.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm underline underline-offset-4 text-sky-400 mt-2 hover:text-sky-300 transition-colors"
            >
              🔗 Ссылка на задание
            </a>
          )} */}
          {!compact && (
            <>
              {order.targetAudience && (
                <p className="text-sm text-mb-turquoise mt-1">
                  Целевая аудитория: {order.targetAudience}
                </p>
              )}
              {order.customer?.name && (
                <p className="text-sm text-mb-gray mt-1">
                  Заказчик: {order.customer.name} {order.customer.level && `(${order.customer.level})`}
                </p>
              )}
            </>
          )}
        </div>
        <Badge variant="gold" className="shrink-0">
          {Number(order.totalReward ?? order.reward ?? 0).toLocaleString()}₽
        </Badge>
      </div>
      
      {/* Изображения */}
      <div className={`flex flex-wrap items-start gap-4 mb-4`}>
        {order.processedImageUrl && (
          <div className="flex-1 min-w-[200px]">
            <h4 className="text-sm font-medium mb-2 text-white">Готовое изображение:</h4>
            <Image 
              src={order.processedImageUrl}
              alt={order.title ? `Изображение заказа: ${order.title}` : 'Готовое изображение'} 
              width={640}
              height={208}
              className="mx-auto max-w-full rounded border-2 border-mb-turquoise max-h-52 object-cover" 
            />
          </div>
        )}
        {order.qrCodeUrl && (
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2 text-white">QR код:</h4>
            <Image src={order.qrCodeUrl} alt="QR Code" width={96} height={96} className="mx-auto w-24 h-24 rounded-md" />
          </div>
        )}
      </div>
      
      {!compact && (
        <>
          {/* Требования */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-white">Требования:</h4>
            <ul className="text-sm text-mb-gray space-y-1">
              <li>• Разместить в сторис {order.socialNetwork || 'Instagram/Telegram'}</li>
              <li>• Сделать скриншот размещения</li>
              <li>• Загрузить скриншот для проверки</li>
            </ul>
          </div>

          {/* Срок выполнения */}
          {order.deadline && (
            <div className="mb-4">
              <p className="text-sm text-mb-gray">
                Срок выполнения: {new Date(order.deadline).toLocaleDateString('ru-RU')}
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Кнопка принять */}
      {!hideAcceptButton && (
        <Button 
          onClick={() => onAccept(order.id)}
          className="w-full hover:shadow-lg hover:shadow-mb-turquoise/50 transition-all duration-300"
        >
          Принять заказ
        </Button>
      )}

      {/* Окно загрузки скриншота */}
      {showScreenshotUpload && onScreenshotUpload && (
        <div className="mt-4 p-4 border border-mb-turquoise/30 rounded-lg bg-mb-black/50">
          <h4 className="text-sm font-semibold mb-2 text-white">Загрузите скриншот выполнения:</h4>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onScreenshotUpload) {
                onScreenshotUpload(file, order.id);
              }
            }}
            className="w-full p-2 border border-mb-gray/20 rounded-lg bg-mb-input text-white text-sm mb-2"
          />
          <p className="text-xs text-mb-gray">Скриншот сторис с размещением задания</p>
        </div>
      )}
    </Card>
  );
}

