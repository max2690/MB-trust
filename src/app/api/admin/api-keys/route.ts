import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/api-keys - Получить список ключей
export async function GET(request: NextRequest) {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/api-keys - Создать новый API ключ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions, expiresAt } = body;
    
    if (!name || !permissions) {
      return NextResponse.json(
        { error: 'Name and permissions are required' },
        { status: 400 }
      );
    }
    
    // Генерируем случайный API ключ
    const key = `mb_${nanoid(48)}`;
    
    // Создаем ключ
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        description: description || null,
        permissions: permissions || ['*'],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/api-keys/:id - Удалить ключ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.apiKey.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'API key deleted'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

