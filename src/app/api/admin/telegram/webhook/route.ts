import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTelegramUserInfo } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Обработка webhook от Telegram
    if (body.message) {
      const { chat, text } = body.message;
      
      // Обработка команды /start
      if (text === '/start') {
        // Здесь можно добавить логику для связывания Telegram аккаунта с пользователем
        console.log(`Пользователь ${chat.id} запустил бота`);
      }
      
      // Обработка других команд
      if (text === '/help') {
        console.log(`Пользователь ${chat.id} запросил помощь`);
      }
    }
    
    // Обработка callback query (нажатие на кнопки)
    if (body.callback_query) {
      const { data, from } = body.callback_query;
      console.log(`Callback от пользователя ${from.id}: ${data}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Ошибка обработки Telegram webhook:', error);
    return NextResponse.json({ error: 'Ошибка обработки webhook' }, { status: 500 });
  }
}

