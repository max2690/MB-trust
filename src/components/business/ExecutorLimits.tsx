'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface ExecutorLimitsProps {
  executorId: string;
}

interface LimitsData {
  executor: {
    id: string;
    level: string;
    daysSinceRegistration: number;
  };
  limits: {
    daily: {
      current: number;
      max: number;
      remaining: number;
    };
    platforms: Record<string, number>;
    maxPerPlatform: number;
  };
}

export function ExecutorLimits({ executorId }: ExecutorLimitsProps) {
  const [limits, setLimits] = useState<LimitsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, [executorId]);

  const fetchLimits = async () => {
    try {
      const response = await fetch(`/api/executor/limits?executorId=${executorId}`);
      const data = await response.json();
      if (data.success) {
        setLimits(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки лимитов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
          <Card>
        <p className="text-mb-gray">Загрузка лимитов...</p>
      </Card>
    );
  }

  if (!limits) {
    return (
          <Card>
        <p className="text-mb-red">Ошибка загрузки лимитов</p>
      </Card>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'NOVICE': return 'bg-mb-gray text-white';
      case 'VERIFIED': return 'bg-mb-turquoise text-mb-black';
      case 'REFERRAL': return 'bg-mb-gold text-mb-black';
      case 'TOP': return 'bg-mb-red text-white';
      default: return 'bg-mb-gray text-white';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'NOVICE': return 'Новичок';
      case 'VERIFIED': return 'Проверенный';
      case 'REFERRAL': return 'Реферальный';
      case 'TOP': return 'Топ';
      default: return level;
    }
  };

  return (
  <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Ваши лимиты</h3>
      
      <div className="space-y-4">
        {/* Уровень и стаж */}
        <div className="flex items-center justify-between">
          <span className="text-mb-gray">Уровень:</span>
          <Badge className={getLevelColor(limits.executor.level)}>
            {getLevelName(limits.executor.level)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-mb-gray">Дней в системе:</span>
          <span className="text-white">{limits.executor.daysSinceRegistration}</span>
        </div>

        {/* Дневные лимиты */}
        <div className="border-t border-mb-gray/20 pt-4">
          <h4 className="text-md font-medium text-white mb-2">Дневные лимиты</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-mb-gray">Выполнено сегодня:</span>
              <span className="text-white">
                {limits.limits.daily.current} / {limits.limits.daily.max}
              </span>
            </div>
            <div className="w-full bg-mb-gray/20 rounded-full h-2">
              <div 
                className="bg-mb-turquoise h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(limits.limits.daily.current / limits.limits.daily.max) * 100}%` 
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mb-gray">Осталось:</span>
              <span className="text-mb-turquoise font-semibold">
                {limits.limits.daily.remaining}
              </span>
            </div>
          </div>
        </div>

        {/* Лимиты по площадкам */}
        <div className="border-t border-mb-gray/20 pt-4">
          <h4 className="text-md font-medium text-white mb-2">Лимиты по площадкам</h4>
          <div className="space-y-2">
            {Object.entries(limits.limits.platforms).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-mb-gray">{platform}:</span>
                <span className="text-white">
                  {count} / {limits.limits.maxPerPlatform}
                </span>
              </div>
            ))}
            {Object.keys(limits.limits.platforms).length === 0 && (
              <p className="text-mb-gray text-sm">Сегодня заказов не брали</p>
            )}
          </div>
        </div>

        {/* Информация о лимитах */}
        <div className="border-t border-mb-gray/20 pt-4">
          <p className="text-xs text-mb-gray">
            Максимум {limits.limits.maxPerPlatform} заказов на одну площадку в день
          </p>
        </div>
      </div>
    </Card>
  );
}

