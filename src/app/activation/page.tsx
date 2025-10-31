'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select UI not needed here after simplification
import Image from 'next/image';

export default function ActivationPage() {
  const [userId, setUserId] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [qrCode, setQrCode] = useState('');
  const [activationId, setActivationId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'uploading' | 'verifying' | 'completed'>('idle');
  const [result, setResult] = useState<{success?: boolean; message?: string; data?: unknown} | null>(null);

  const generateQRCode = async () => {
    if (!userId) {
      alert('Введите ID пользователя');
      return;
    }

    setStatus('generating');
    try {
      const response = await fetch('/api/activation/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, platform }),
      });

      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setActivationId(data.activationId);
        setStatus('idle');
      } else {
        alert(data.error || 'Ошибка генерации QR-кода');
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Ошибка генерации QR-кода');
      setStatus('idle');
    }
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScreenshot(file);
    }
  };

  const verifyActivation = async () => {
    if (!screenshot || !activationId) {
      alert('Загрузите скриншот и сгенерируйте QR-код');
      return;
    }

    setStatus('verifying');
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('userId', userId);
      formData.append('activationId', activationId);

      const response = await fetch('/api/activation/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      setResult(data);
      setStatus('completed');
    } catch (error) {
      console.error('Error verifying activation:', error);
      alert('Ошибка проверки активации');
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setUserId('');
    setPlatform('instagram');
    setQrCode('');
    setActivationId('');
    setScreenshot(null);
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🎯 Активация аккаунта</h1>
        <p className="text-gray-600 mt-2">
          Создайте QR-код для активации пользователя через размещение в соцсетях
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Настройки активации */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Настройки активации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>ID пользователя</Label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Введите ID пользователя"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Платформа</Label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-1 flex h-12 w-full rounded-xl border border-mb-border bg-mb-input px-4 py-3 text-base text-mb-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-mb-black"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="vk">VK</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
              
              <Button 
                onClick={generateQRCode}
                disabled={!userId || status === 'generating'}
                className="w-full"
              >
                {status === 'generating' ? 'Генерируем...' : 'Сгенерировать QR-код'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR-код */}
        {qrCode && (
          <Card>
            <CardHeader>
              <CardTitle>📱 QR-код для размещения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Image 
                  src={qrCode}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="mx-auto mb-4 border rounded-lg"
                  priority
                />
                <p className="text-sm text-gray-600 mb-4">
                  Пользователь должен разместить этот QR-код в своей сторис
                </p>
                <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCode;
                    link.download = `activation-qr-${userId}.png`;
                    link.click();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  📥 Скачать QR-код
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Загрузка скриншота */}
      {qrCode && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📸 Проверка активации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Скриншот размещения</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Загрузите скриншот размещения QR-кода пользователем
                </p>
              </div>
              
              {screenshot && (
                <div className="space-y-4">
                  <div className="mx-auto" style={{ maxWidth: '300px' }}>
                    <Image 
                      src={URL.createObjectURL(screenshot)} 
                      alt="Screenshot preview" 
                      width={300}
                      height={300}
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                  
                  <Button 
                    onClick={verifyActivation}
                    disabled={status === 'verifying'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {status === 'verifying' ? 'Проверяем...' : '✅ Проверить активацию'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Результат проверки */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🤖 Результат проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-lg font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Активация успешна!' : '❌ Активация не прошла'}
              </div>
              <p className={`mt-2 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              
              {(() => {
                const details = (result as unknown as {
                  details?: { qrCodeDetected: boolean; platformMatch: boolean; qualityScore?: number }
                }).details;
                return details ? (
                  <div className="mt-4 text-sm">
                    <div className="font-semibold mb-2">Детали проверки:</div>
                    <div className="space-y-1">
                      <div>QR-код обнаружен: {details.qrCodeDetected ? '✅' : '❌'}</div>
                      <div>Соответствие платформе: {details.platformMatch ? '✅' : '❌'}</div>
                      <div>Качество изображения: {details.qualityScore?.toFixed(2)}</div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={resetForm}
                variant="outline"
                className="w-full"
              >
                🔄 Создать новую активацию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
