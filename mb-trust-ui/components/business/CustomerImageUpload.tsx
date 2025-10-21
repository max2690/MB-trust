import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CustomerImageUploadProps {
  onImageProcessed: (processedImageUrl: string, qrCodeUrl: string, orderId: string) => void;
}

export function CustomerImageUpload({ onImageProcessed }: CustomerImageUploadProps) {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/images/process', {
        method: 'POST',
        body: formData
      });
      
      const { processedImageUrl, qrCodeUrl, orderId } = await response.json();
      
      if (!response.ok) {
        throw new Error('Ошибка обработки изображения');
      }
      
      setProcessedImage(processedImageUrl);
      setQrCodeUrl(qrCodeUrl);
      setOrderId(orderId);
      onImageProcessed(processedImageUrl, qrCodeUrl, orderId);
      
    } catch (error) {
      console.error('Ошибка обработки изображения:', error);
      alert('Ошибка обработки изображения. Попробуйте еще раз.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Загрузите изображение для рекламы</h3>
      
      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setOriginalImage(file);
                handleImageUpload(file);
              }
            }}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Обрабатывается...' : 'Выбрать изображение'}
          </Button>
        </div>

        {originalImage && (
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2 text-white">Ваше изображение:</h4>
            <img 
              src={URL.createObjectURL(originalImage)} 
              alt="Original" 
              className="mx-auto max-w-full h-48 object-cover rounded" 
            />
          </div>
        )}

        {processedImage && (
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2 text-white">Готовое изображение с QR кодом:</h4>
            <img 
              src={processedImage} 
              alt="Processed" 
              className="mx-auto max-w-full h-48 object-cover rounded border-2 border-mb-turquoise" 
            />
          </div>
        )}

        {qrCodeUrl && (
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2 text-white">QR код для размещения:</h4>
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="mx-auto w-32 h-32" 
            />
          </div>
        )}

        {orderId && (
          <div className="text-center">
            <p className="text-sm text-mb-gray">ID заказа: {orderId}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

