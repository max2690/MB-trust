import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Order } from "../../lib/types";

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
}

export function OrderCard({ order, onAccept }: OrderCardProps) {
  return (
    <Card className="p-6 hover:shadow-glow transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{order.title}</h3>
          <p className="text-mb-gray">{order.description}</p>
          <p className="text-sm text-mb-turquoise mt-1">
            Целевая аудитория: {order.targetAudience}
          </p>
          {order.customer && (
            <p className="text-sm text-mb-gray mt-1">
              Заказчик: {order.customer.name} ({order.customer.level})
            </p>
          )}
        </div>
        <Badge variant="gold">{order.reward}₽</Badge>
      </div>
      
      {/* Готовое изображение с QR кодом */}
      <div className="text-center mb-4">
        <h4 className="text-sm font-medium mb-2 text-white">Готовое изображение для размещения:</h4>
        <img 
          src={order.processedImageUrl} 
          alt="Ready to post" 
          className="mx-auto max-w-full h-48 object-cover rounded border-2 border-mb-turquoise" 
        />
        <p className="text-xs text-mb-gray mt-2">
          Просто скопируйте это изображение в вашу сторис
        </p>
      </div>
      
      {/* QR код отдельно */}
      <div className="text-center mb-4">
        <h4 className="text-sm font-medium mb-2 text-white">QR код отдельно:</h4>
        <img src={order.qrCodeUrl} alt="QR Code" className="mx-auto w-24 h-24" />
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
          Срок выполнения: {new Date(order.deadline).toLocaleDateString('ru-RU')}
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

