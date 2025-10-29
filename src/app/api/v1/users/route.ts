import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkPermission, ApiRequest } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/v1/users/:id - Получить пользователя
export async function GET(request: NextRequest) {
  try {
    const validationError = await validateApiKey(request);
    if (validationError) return validationError;
    
    if (!checkPermission(request as ApiRequest, 'users:read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    
    let user = null;
    
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          level: true,
          balance: true,
          isVerified: true,
          isBlocked: true,
          city: true,
          region: true,
          country: true,
          totalExecutions: true,
          averageRating: true
        }
      });
    } else if (phone) {
      user = await prisma.user.findUnique({
        where: { phone },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          level: true,
          balance: true,
          isVerified: true,
          isBlocked: true,
          city: true,
          region: true,
          country: true,
          totalExecutions: true,
          averageRating: true
        }
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          level: true,
          balance: true,
          isVerified: true,
          isBlocked: true,
          city: true,
          region: true,
          country: true,
          totalExecutions: true,
          averageRating: true
        }
      });
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

