'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { CustomerImageUpload } from './CustomerImageUpload';

interface PlatformConfig {
  platform: string;
  quantity: number;
}

interface CalculationResult {
  totalCost: number;
  totalQuantity: number;
  platformCosts: Record<string, number>;
  dailyDistribution: Record<string, Record<string, number>>;
  dailyCosts: Record<string, number>;
  executionDays: number;
  startDate: string;
  endDate: string;
  refundDeadline: string;
}

interface AdvancedOrderFormProps {
  onSubmit: (orderData: any) => void;
}

export function AdvancedOrderForm({ onSubmit }: AdvancedOrderFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    campaignType: 'SINGLE',
    executionDays: 1,
    autoDistribution: true,
    refundOnFailure: true
  });

  const [platforms, setPlatforms] = useState<PlatformConfig[]>([
    { platform: 'INSTAGRAM', quantity: 1 }
  ]);

  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Рассчитываем стоимость при изменении параметров
  useEffect(() => {
    if (platforms.length > 0 && platforms.some(p => p.quantity > 0)) {
      calculateCost();
    }
  }, [platforms, formData.campaignType, formData.executionDays, formData.autoDistribution]);

  const calculateCost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms,
          campaignType: formData.campaignType,
          executionDays: formData.executionDays,
          autoDistribution: formData.autoDistribution
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data.calculation);
      }
    } catch (error) {
      console.error('Ошибка расчета:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlatform = () => {
    setPlatforms([...platforms, { platform: 'INSTAGRAM', quantity: 1 }]);
  };

  const removePlatform = (index: number) => {
    if (platforms.length > 1) {
      setPlatforms(platforms.filter((_, i) => i !== index));
    }
  };

  const updatePlatform = (index: number, field: keyof PlatformConfig, value: any) => {
    const updated = [...platforms];
    updated[index] = { ...updated[index], [field]: value };
    setPlatforms(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!processedImageUrl || !qrCodeUrl || !orderId || !calculation) {
      alert('Пожалуйста, загрузите изображение и дождитесь расчета стоимости');
      return;
    }
    
    onSubmit({
      ...formData,
      platforms,
      totalCost: calculation.totalCost,
      totalQuantity: calculation.totalQuantity,
      dailyDistribution: calculation.dailyDistribution,
      refundDeadline: calculation.refundDeadline,
      processedImageUrl,
      qrCodeUrl,
      orderId
    });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-white">Создать расширенный заказ</h2>
      
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
              Тип кампании
            </label>
            <select
              value={formData.campaignType}
              onChange={(e) => setFormData({...formData, campaignType: e.target.value})}
              className="w-full p-3 border border-mb-gray/20 rounded-xl bg-mb-input text-white"
            >
              <option value="SINGLE">Одиночный заказ</option>
              <option value="WEEKLY">Недельная кампания</option>
              <option value="BIWEEKLY">Двухнедельная кампания</option>
            </select>
          </div>
        </div>

        {/* Настройки кампании */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Дней выполнения
            </label>
            <Input
              type="number"
              min="1"
              max="30"
              value={formData.executionDays}
              onChange={(e) => setFormData({...formData, executionDays: Number(e.target.value)})}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoDistribution"
              checked={formData.autoDistribution}
              onChange={(e) => setFormData({...formData, autoDistribution: e.target.checked})}
              className="w-4 h-4"
            />
            <label htmlFor="autoDistribution" className="text-white">
              Автоматическое распределение
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="refundOnFailure"
              checked={formData.refundOnFailure}
              onChange={(e) => setFormData({...formData, refundOnFailure: e.target.checked})}
              className="w-4 h-4"
            />
            <label htmlFor="refundOnFailure" className="text-white">
              Возврат при невыполнении
            </label>
          </div>
        </div>

        {/* Платформы */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Платформы</h3>
            <Button type="button" onClick={addPlatform} variant="outline">
              + Добавить платформу
            </Button>
          </div>
          
          <div className="space-y-4">
            {platforms.map((platform, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-mb-gray/20 rounded-lg">
                <select
                  value={platform.platform}
                  onChange={(e) => updatePlatform(index, 'platform', e.target.value)}
                  className="p-2 border border-mb-gray/20 rounded bg-mb-input text-white"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="VK">VKontakte</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="FACEBOOK">Facebook</option>
                </select>
                
                <Input
                  type="number"
                  min="1"
                  value={platform.quantity}
                  onChange={(e) => updatePlatform(index, 'quantity', Number(e.target.value))}
                  placeholder="Количество"
                  className="w-32"
                />
                
                <span className="text-mb-gray">сторис</span>
                
                {platforms.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removePlatform(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Удалить
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Калькулятор */}
        {calculation && (
          <Card className="p-6 bg-mb-gray/10">
            <h3 className="text-lg font-semibold text-white mb-4">Расчет стоимости</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-2">Общая информация</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-mb-gray">Общая сумма:</span>
                    <span className="text-mb-turquoise font-bold">{calculation.totalCost.toLocaleString()}₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mb-gray">Всего сторис:</span>
                    <span className="text-white">{calculation.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mb-gray">Дней выполнения:</span>
                    <span className="text-white">{calculation.executionDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mb-gray">Дедлайн возврата:</span>
                    <span className="text-mb-gold">{new Date(calculation.refundDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">По платформам</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(calculation.platformCosts).map(([platform, cost]) => (
                    <div key={platform} className="flex justify-between">
                      <span className="text-mb-gray">{platform}:</span>
                      <span className="text-white">{cost.toLocaleString()}₽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Распределение по дням */}
            {formData.autoDistribution && (
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">Распределение по дням</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {Object.entries(calculation.dailyCosts).map(([day, cost]) => (
                    <div key={day} className="p-3 border border-mb-gray/20 rounded">
                      <div className="font-medium text-white">{day}</div>
                      <div className="text-mb-turquoise">{cost.toLocaleString()}₽</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

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
          disabled={!processedImageUrl || !qrCodeUrl || !orderId || !calculation || loading}
          className="w-full"
        >
          {loading ? 'Расчет...' : `Создать заказ за ${calculation?.totalCost.toLocaleString()}₽`}
        </Button>
      </form>
    </Card>
  );
}

