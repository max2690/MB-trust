'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { CustomerImageUpload } from './CustomerImageUpload';

interface CreateOrderFormProps {
  onSubmit: (orderData: OrderData) => void;
}

interface OrderData {
  title: string;
  description: string;
  targetAudience: string;
  budget: number;
  processedImageUrl: string;
  qrCodeUrl: string;
  orderId: string;
}

export function CreateOrderForm({ onSubmit }: CreateOrderFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    budget: 1000,
    quantity: 1,
    socialNetwork: 'INSTAGRAM',
    deadline: ''
  });
  
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!processedImageUrl || !qrCodeUrl || !orderId) {
      alert('Пожалуйста, загрузите изображение');
      return;
    }
    
    onSubmit({
      ...formData,
      processedImageUrl,
      qrCodeUrl,
      orderId
    });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-white">Создать заказ</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Название заказа
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Реклама нового продукта"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Общая сумма (₽)
            </label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
              placeholder="1000"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Количество публикаций
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              placeholder="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Социальная сеть
            </label>
            <select
              value={formData.socialNetwork}
              onChange={(e) => setFormData({...formData, socialNetwork: e.target.value})}
              className="w-full p-3 border border-mb-gray/20 rounded-xl bg-mb-input text-white"
              required
            >
              <option value="INSTAGRAM">Instagram</option>
              <option value="TIKTOK">TikTok</option>
              <option value="VK">VKontakte</option>
              <option value="TELEGRAM">Telegram</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="FACEBOOK">Facebook</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Срок выполнения
            </label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Опишите, что нужно рекламировать..."
            className="w-full p-3 border border-mb-gray/20 rounded-xl bg-mb-input text-white min-h-[100px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Целевая аудитория
          </label>
          <Input
            value={formData.targetAudience}
            onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
            placeholder="Молодежь 18-25 лет, интересы: мода, технологии"
            required
          />
        </div>

        {/* Загрузка изображения */}
        <CustomerImageUpload 
          onImageProcessed={(processedUrl, qrUrl, orderId) => {
            setProcessedImageUrl(processedUrl);
            setQrCodeUrl(qrUrl);
            setOrderId(orderId);
          }}
        />

        {/* Кнопка создания */}
        <Button 
          type="submit"
          disabled={!processedImageUrl || !qrCodeUrl || !orderId}
          className="w-full"
        >
          Создать заказ
        </Button>
      </form>
    </Card>
  );
}
