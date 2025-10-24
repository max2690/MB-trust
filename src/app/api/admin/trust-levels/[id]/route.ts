import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/trust-levels/[id] - Обновить уровень доверия
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const levelId = params.id;
    const {
      name,
      displayName,
      minPricePerStory,
      commissionRate,
      minExecutions,
      minRating,
      minDaysActive,
      isActive,
      adminNotes
    } = await request.json();

    // Проверяем существование уровня
    const existingLevel = await prisma.trustLevel.findUnique({
      where: { id: levelId }
    });

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Уровень доверия не найден' },
        { status: 404 }
      );
    }

    // Обновляем уровень
    const updatedLevel = await prisma.trustLevel.update({
      where: { id: levelId },
      data: {
        ...(name && { name }),
        ...(displayName && { displayName }),
        ...(minPricePerStory && { minPricePerStory: parseFloat(minPricePerStory) }),
        ...(commissionRate && { commissionRate: parseFloat(commissionRate) }),
        ...(minExecutions && { minExecutions: parseInt(minExecutions) }),
        ...(minRating && { minRating: parseFloat(minRating) }),
        ...(minDaysActive && { minDaysActive: parseInt(minDaysActive) }),
        ...(isActive !== undefined && { isActive }),
        ...(adminNotes !== undefined && { adminNotes })
      }
    });

    return NextResponse.json({ 
      success: true, 
      trustLevel: updatedLevel,
      message: 'Уровень доверия обновлен успешно'
    });
  } catch (error) {
    console.error('Error updating trust level:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления уровня доверия' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/trust-levels/[id] - Удалить уровень доверия
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const levelId = params.id;

    // Проверяем существование уровня
    const existingLevel = await prisma.trustLevel.findUnique({
      where: { id: levelId },
      include: {
        users: true,
        orders: true
      }
    });

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Уровень доверия не найден' },
        { status: 404 }
      );
    }

    // Проверяем, используется ли уровень
    if (existingLevel.users.length > 0 || existingLevel.orders.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить уровень, который используется пользователями или заказами' },
        { status: 400 }
      );
    }

    // Удаляем уровень
    await prisma.trustLevel.delete({
      where: { id: levelId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Уровень доверия удален успешно'
    });
  } catch (error) {
    console.error('Error deleting trust level:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления уровня доверия' },
      { status: 500 }
    );
  }
}
