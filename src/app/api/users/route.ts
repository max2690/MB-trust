export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, country, region, role, password } = body

    // Проверяем, что телефон не занят
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Phone number already registered' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        country,
        region,
        role: role as UserRole,
        passwordHash: hashedPassword,
        level: 'NOVICE',
        balance: 0,
        isVerified: false,
        isBlocked: false
      }
    })

    // Убираем пароль из ответа
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as UserRole | null
    const userId = searchParams.get('userId')
    const telegramId = searchParams.get('telegramId')

    const where: { role?: UserRole; id?: string; telegramId?: string } = {}
    if (role) where.role = role
    if (userId) where.id = userId
    if (telegramId) where.telegramId = telegramId

    // Если указан userId или telegramId, возвращаем одного пользователя
    if (userId || telegramId) {
      const user = await prisma.user.findUnique({
        where: userId ? { id: userId } : { telegramId: telegramId! },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          country: true,
          region: true,
          role: true,
          level: true,
          balance: true,
          isVerified: true,
          isBlocked: true,
          createdAt: true,
          telegramId: true,
          telegramUsername: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, user })
    }

    // Иначе возвращаем список пользователей
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        country: true,
        region: true,
        role: true,
        level: true,
        balance: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
