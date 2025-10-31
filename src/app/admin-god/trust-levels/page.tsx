'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TrustLevel {
  id: string;
  name: string;
  displayName: string;
  minPricePerStory: number;
  commissionRate: number;
  minExecutions: number;
  minRating: number;
  minDaysActive: number;
  isActive: boolean;
  adminNotes?: string;
}

export default function TrustLevelsPage() {
  const [trustLevels, setTrustLevels] = useState<TrustLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLevel] = useState<TrustLevel | null>(null);

  useEffect(() => {
    fetchTrustLevels();
  }, []);

  const fetchTrustLevels = async () => {
    try {
      const response = await fetch('/api/admin/trust-levels');
      const data = await response.json();
      
      if (data.success) {
        setTrustLevels(data.trustLevels);
      }
    } catch (error) {
      console.error('Error fetching trust levels:', error);
    } finally {
      setLoading(false);
    }
  };

  type UpdatableField = keyof Pick<TrustLevel, 'minPricePerStory' | 'commissionRate' | 'minExecutions' | 'minRating' | 'minDaysActive' | 'adminNotes' | 'isActive'>;
  const updateLevel = async (levelId: string, field: UpdatableField, value: string | number | boolean) => {
    try {
      const response = await fetch(`/api/admin/trust-levels/${levelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchTrustLevels(); // Обновляем список
      } else {
        alert(data.error || 'Ошибка обновления уровня');
      }
    } catch (error) {
      console.error('Error updating trust level:', error);
      alert('Ошибка обновления уровня');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">👑 Управление уровнями доверия</h1>
        <p className="text-gray-600 mt-2">
          Настройте уровни доверия, минимальные цены и комиссии
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustLevels.map((level) => (
          <Card key={level.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{level.displayName}</span>
                <div className={`w-3 h-3 rounded-full ${
                  level.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Минимальная цена за сторис (₽)</Label>
                  <Input
                    type="number"
                    value={level.minPricePerStory}
                    onChange={(e) => updateLevel(level.id, 'minPricePerStory', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Комиссия платформы (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={(level.commissionRate * 100).toFixed(1)}
                    onChange={(e) => updateLevel(level.id, 'commissionRate', parseFloat(e.target.value) / 100)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Минимум выполненных заданий</Label>
                  <Input
                    type="number"
                    value={level.minExecutions}
                    onChange={(e) => updateLevel(level.id, 'minExecutions', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Минимальный рейтинг</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={level.minRating}
                    onChange={(e) => updateLevel(level.id, 'minRating', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Минимум дней активности</Label>
                  <Input
                    type="number"
                    value={level.minDaysActive}
                    onChange={(e) => updateLevel(level.id, 'minDaysActive', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Заметки админа</Label>
                  <Textarea
                    value={level.adminNotes || ''}
                    onChange={(e) => updateLevel(level.id, 'adminNotes', e.target.value)}
                    placeholder="Внутренние заметки..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={level.isActive}
                    onChange={(e) => updateLevel(level.id, 'isActive', e.target.checked)}
                    className="rounded"
                  />
                  <Label>Активный уровень</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Статистика уровней */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📊 Статистика по уровням</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trustLevels.map((level) => (
              <div key={level.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{level.displayName}</div>
                <div className="text-sm text-gray-600">
                  от {level.minPricePerStory}₽ за сторис
                </div>
                <div className="text-sm text-gray-600">
                  {(level.commissionRate * 100).toFixed(0)}% комиссия
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
