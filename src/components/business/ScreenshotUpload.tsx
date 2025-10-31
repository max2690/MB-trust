'use client';

import Img from "../ui/Img";
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ScreenshotUploadProps {
  orderId: string;
  executorId: string;
  onUpload: (file: File, orderId: string, executorId: string) => Promise<void>;
}

export function ScreenshotUpload({ orderId, executorId, onUpload }: ScreenshotUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleSubmit = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      await onUpload(file, orderId, executorId);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-white">Загрузите скриншот:</h3>
      
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-3 border border-mb-gray/20 rounded-xl bg-mb-input text-white"
        />
        
        {file && (
          <div className="text-center">
            <div className="relative mx-auto h-48 w-full max-w-xl">
              <Img src={URL.createObjectURL(file)} alt={`Preview ${file.name}`} fill />
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Загружается...' : 'Отправить на проверку'}
        </Button>
      </div>
    </Card>
  );
}
