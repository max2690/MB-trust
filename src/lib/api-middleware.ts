import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface ApiRequest extends NextRequest {
  apiKey?: {
    id: string;
    permissions: string[];
  };
}

export async function validateApiKey(request: NextRequest): Promise<NextResponse | null> {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required. Use X-API-Key header or Bearer token.' },
      { status: 401 }
    );
  }
  
  // Находим ключ в БД
  const keyData = await prisma.apiKey.findUnique({
    where: { key: apiKey, isActive: true }
  });
  
  if (!keyData) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  // Проверяем срок действия
  if (keyData.expiresAt && keyData.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'API key expired' },
      { status: 401 }
    );
  }
  
  // Обновляем статистику
  await prisma.apiKey.update({
    where: { id: keyData.id },
    data: {
      lastUsed: new Date(),
      requestCount: { increment: 1 }
    }
  });
  
  // Добавляем данные ключа в request
  (request as ApiRequest).apiKey = {
    id: keyData.id,
    permissions: keyData.permissions as string[]
  };
  
  return null; // OK
}

export function checkPermission(request: ApiRequest, permission: string): boolean {
  if (!request.apiKey) return false;
  return request.apiKey.permissions.includes(permission) || 
         request.apiKey.permissions.includes('*'); // * = все права
}

