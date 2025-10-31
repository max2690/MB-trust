/* eslint-disable @typescript-eslint/no-explicit-any */
import TelegramBot from 'node-telegram-bot-api'

const INTRO = [
  'Привет! 👋 Я помогу тебе зарегистрироваться в MB‑TRUST.',
  '',
  'Сейчас я задам тебе несколько вопросов о себе. Можешь отвечать в любой форме — я пойму! 😊',
  '',
  'Начнём?'
].join('\n')

// Тип для собранных данных
interface CollectedData {
  real?: string;          // yes/no
  messenger?: string;     // Telegram, VK, WhatsApp, TenChat
  city?: string;          // город
  followers?: number;     // количество подписчиков
  daily?: boolean;        // хочет ли получать задания ежедневно
  name?: string;          // имя и фамилия
}

// Проверка, что все данные собраны
function isDataComplete(data: CollectedData): boolean {
  return !!(
    data.real &&
    data.messenger &&
    data.city &&
    data.followers !== undefined &&
    data.daily !== undefined &&
    data.name
  )
}

// Сообщение о том, чего не хватает
function getMissingFields(data: CollectedData): string {
  const missing: string[] = []
  const collected: string[] = []
  
  if (!data.real) {
    missing.push('• подтверждение, что ты реальный человек')
  } else {
    collected.push('✓ Подтверждение реальности')
  }
  
  if (!data.messenger) {
    missing.push('• предпочитаемый мессенджер (Telegram/VK/WhatsApp/TenChat)')
  } else {
    collected.push(`✓ Мессенджер: ${data.messenger}`)
  }
  
  if (!data.city) {
    missing.push('• город проживания')
  } else {
    collected.push(`✓ Город: ${data.city}`)
  }
  
  if (data.followers === undefined) {
    missing.push('• примерное количество подписчиков')
  } else {
    collected.push(`✓ Подписчики: ${data.followers}`)
  }
  
  if (data.daily === undefined) {
    missing.push('• хочешь ли получать задания ежедневно')
  } else {
    collected.push(`✓ Ежедневные задания: ${data.daily ? 'да' : 'нет'}`)
  }
  
  if (!data.name) {
    missing.push('• твоё имя')
  } else {
    collected.push(`✓ Имя: ${data.name}`)
  }
  
  if (missing.length === 0) return ''
  
  let result = '\n\n✅ Уже собрано:\n' + collected.join('\n')
  result += '\n\n📝 Ещё нужно:\n' + missing.join('\n')
  return result
}

// Функция для работы с OpenAI
async function processWithAI(
  userMessage: string,
  collectedData: CollectedData,
  conversationHistory: Array<{role: string, content: string}>
): Promise<{ response: string; extracted: Partial<CollectedData> }> {
  const openaiKey = process.env.OPENAI_API_KEY
  
  if (!openaiKey) {
    // Fallback без AI - простые подсказки
    const missing = getMissingFields(collectedData)
    let fallbackResponse = 'Спасибо за ответ! '
    
    if (!collectedData.real) {
      fallbackResponse = 'Подтверди, пожалуйста, что ты реальный человек 😊'
    } else if (!collectedData.messenger) {
      fallbackResponse = 'Какой мессенджер ты используешь чаще всего? (Telegram, VK, WhatsApp, TenChat)'
    } else if (!collectedData.city) {
      fallbackResponse = 'В каком городе ты живешь?'
    } else if (collectedData.followers === undefined) {
      fallbackResponse = 'Сколько у тебя примерно подписчиков? (напиши число)'
    } else if (collectedData.daily === undefined) {
      fallbackResponse = 'Хочешь получать задания каждый день? (да/нет)'
    } else if (!collectedData.name) {
      fallbackResponse = 'Как тебя зовут? (имя и фамилия)'
    } else {
      fallbackResponse = 'Отлично! Спасибо за информацию.'
    }
    
    return {
      response: fallbackResponse,
      extracted: {}
    }
  }

  try {
    // Формируем промпт для AI
    const systemPrompt = `Ты дружелюбный помощник для платформы MB-TRUST. Твоя задача — собрать информацию о пользователе в естественном диалоге.

Нужно собрать:
1. Подтверждение, что это реальный человек (да/нет) -> сохрани как "yes" или "no"
2. Предпочитаемый мессенджер (одно из: Telegram, VK, WhatsApp, TenChat)
3. Город проживания
4. Примерное количество подписчиков (число)
5. Хочет ли получать задания ежедневно (да/нет) -> сохрани как true/false
6. Имя и фамилия

Уже собрано: ${JSON.stringify(collectedData)}

ВАЖНО:
- Веди диалог естественно, дружелюбно, как живой человек
- Если пользователь еще не рассказал что-то — спроси об этом мягко, по одному вопросу
- Если пользователь уже упомянул что-то — подтверди это и переходи к следующему
- Не задавай все вопросы сразу — задавай по 1-2, естественно
- Подсказывай пользователю, что еще нужно узнать
- Если ответ непонятен — уточни вопрос, но более простыми словами
- Используй эмодзи для дружелюбия

Отвечай КОРОТКО (1-2 предложения), дружелюбно.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 200
      })
    })

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || 'Спасибо! Расскажи еще немного о себе.'

    // Извлекаем данные из ответа пользователя с помощью AI
    const extractResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Извлеки структурированные данные из сообщения пользователя. Верни ТОЛЬКО JSON объект без дополнительного текста с полями: real (yes/no или null), messenger (одно из: Telegram, VK, WhatsApp, TenChat или null), city (строка или null), followers (число или null), daily (true/false или null), name (строка или null). Если данных нет в сообщении - верни null для этого поля. Формат ответа: {"real": "yes", "messenger": null, "city": "Москва", "followers": 5000, "daily": true, "name": null}`
          },
          {
            role: 'user',
            content: `Сообщение пользователя: "${userMessage}". Уже собрано: ${JSON.stringify(collectedData)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      })
    })

    const extractData = await extractResponse.json()
    const extracted: Partial<CollectedData> = {}
    
    try {
      const parsed = JSON.parse(extractData.choices[0]?.message?.content || '{}')
      if (parsed.real && !collectedData.real) extracted.real = parsed.real
      if (parsed.messenger && !collectedData.messenger) extracted.messenger = parsed.messenger
      if (parsed.city && !collectedData.city) extracted.city = parsed.city
      if (parsed.followers !== null && parsed.followers !== undefined && collectedData.followers === undefined) {
        extracted.followers = Number(parsed.followers)
      }
      if (parsed.daily !== undefined && parsed.daily !== null && collectedData.daily === undefined) {
        extracted.daily = Boolean(parsed.daily)
      }
      if (parsed.name && !collectedData.name) extracted.name = parsed.name
    } catch (e) {
      console.error('Ошибка парсинга данных от AI:', e)
    }

    return { response: aiResponse, extracted }
  } catch (error) {
    console.error('OpenAI error:', error)
    return {
      response: 'Спасибо! Расскажи еще немного о себе.',
      extracted: {}
    }
  }
}

const sessions = new Map<number, {
  code?: string;
  waitingForCode?: boolean; // Ожидаем ли ввод кода от пользователя
  data: CollectedData;
  conversationHistory: Array<{role: string, content: string}>;
}>()

let botInstance: InstanceType<typeof TelegramBot> | null = null;
let isInitialized = false;

export const initializeTelegramBot = () => {
  // Предотвращаем дублирование инициализации
  if (isInitialized && botInstance) {
    console.log('⚠️ Telegram бот уже инициализирован, пропускаем повторный запуск')
    return botInstance
  }

  const token = process.env.BOT_TOKEN
  if (!token) {
    console.log('⚠️ BOT_TOKEN не найден, бот не запущен')
    return
  }

  // Останавливаем предыдущий экземпляр если он был
  if (botInstance) {
    try {
      botInstance.stopPolling()
      botInstance.stopWebHook()
      botInstance = null
    } catch (e) {
      // Игнорируем ошибки остановки
    }
  }

  try {
    const bot = new TelegramBot(token, { polling: true })
    botInstance = bot
    isInitialized = true

    // команды / описание
    bot.setMyCommands([
      { command: 'start', description: 'Начать верификацию/привязку' },
      { command: 'help', description: 'Краткая справка' },
    ]).catch(() => {})
    bot.setMyDescription('MB‑TRUST — платформа траст‑маркетинга. Задания, отчётность, автоматические выплаты.').catch(() => {})

    // Функция для проверки кода и начала диалога
    const startVerificationWithCode = async (chatId: number, code: string) => {
      try {
        // Проверяем код в базе данных
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verification/telegram/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            telegramId: chatId.toString(),
            checkOnly: true // Только проверка, без завершения
          })
        })
        
        const result = await response.json()
        
        if (!result.valid) {
          await bot.sendMessage(chatId, '❌ Неверный код верификации. Пожалуйста, проверь код и попробуй снова.\n\nИли перейди в личный кабинет MB‑TRUST и получи новую ссылку для верификации.')
          return false
        }

        // Код верный, начинаем диалог
        sessions.set(chatId, { 
          code, 
          data: {}, 
          conversationHistory: [
            { role: 'system', content: 'Начало диалога для сбора информации о пользователе для регистрации в MB-TRUST.' }
          ]
        })

        // Начинаем диалог с AI
        const session = sessions.get(chatId)!
        const { response: aiResponse } = await processWithAI('Привет! Начинаем сбор информации.', session.data, session.conversationHistory)
        
        session.conversationHistory.push(
          { role: 'assistant', content: aiResponse }
        )
        
        await bot.sendMessage(chatId, INTRO + '\n\n' + aiResponse + getMissingFields(session.data))
        return true
      } catch (error) {
        console.error('Ошибка проверки кода:', error)
        await bot.sendMessage(chatId, '⚠️ Ошибка при проверке кода. Попробуй позже или обратись в поддержку.')
        return false
      }
    }

    bot.onText(/\/start(?:\s+(.+))?/, async (msg: any, match: any) => {
      const chatId = msg.chat.id
      const payload = match?.[1]?.trim() || ''

      let code: string | undefined
      if (payload.startsWith('link_')) {
        code = payload.substring('link_'.length)
      }

      if (code) {
        // Код передан в ссылке
        await startVerificationWithCode(chatId, code)
      } else {
        // Код не передан - спрашиваем у пользователя
        await bot.sendMessage(chatId, INTRO + '\n\n📝 Для начала введи код верификации, который ты получил на сайте MB‑TRUST.\n\nКод можно получить в личном кабинете в разделе "Верификация через Telegram".')
        
        // Устанавливаем флаг ожидания кода
        sessions.set(chatId, {
          waitingForCode: true,
          data: {},
          conversationHistory: []
        })
      }
    })

    bot.onText(/\/help/, async (msg: any) => {
      const chatId = msg.chat.id
      await bot.sendMessage(chatId, [
        '📚 Помощь:',
        '',
        '1) Личный кабинет → "Верификация через Telegram"',
        '2) Нажми "Начать привязку" и перейди по ссылке',
        '3) Отвечай на мои вопросы в любой форме',
        '4) Вернись на сайт — статус обновится автоматически',
        '',
        '💡 Можешь отвечать сразу на несколько вопросов или рассказывать о себе свободно — я пойму! 😊'
      ].join('\n'))
    })

    bot.on('message', async (msg: any) => {
      const chatId = msg.chat.id
      if (!sessions.has(chatId)) return
      if (msg.text?.startsWith('/start') || msg.text?.startsWith('/help')) return

      const session = sessions.get(chatId)!
      const text = String(msg.text || '').trim()

      if (!text) {
        await bot.sendMessage(chatId, 'Пожалуйста, напиши текстовое сообщение 😊')
        return
      }

      // Если ожидаем код от пользователя
      if (session.waitingForCode && !session.code) {
        const code = text.trim()
        // Проверяем формат кода (обычно это hex строка длиной 6 символов)
        if (code.length < 4 || code.length > 20) {
          await bot.sendMessage(chatId, '❌ Код верификации должен быть от 4 до 20 символов. Проверь код и попробуй снова.')
          return
        }
        
        // Пытаемся использовать код для начала верификации
        const success = await startVerificationWithCode(chatId, code)
        // startVerificationWithCode уже создаст новую сессию с кодом, поэтому просто удаляем текущую
        if (!success) {
          // Код неверный - оставляем сессию с флагом waitingForCode для повторной попытки
          return
        }
        // Если успешно, сессия уже пересоздана в startVerificationWithCode, можно выйти
        return
      }

      // Добавляем сообщение пользователя в историю
      session.conversationHistory.push({ role: 'user', content: text })

      // Обрабатываем с помощью AI
      const { response, extracted } = await processWithAI(
        text,
        session.data,
        session.conversationHistory
      )

      // Обновляем собранные данные
      Object.assign(session.data, extracted)

      // Добавляем ответ AI в историю
      session.conversationHistory.push({ role: 'assistant', content: response })

      // Проверяем, собраны ли все данные
      if (isDataComplete(session.data)) {
        // Все данные собраны!
        try {
          const resp = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verification/telegram/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: session.code,
              telegramId: msg.from.id,
              telegramUsername: msg.from.username,
              name: session.data.name,
              city: session.data.city,
              preferredMessenger: session.data.messenger,
              followersApprox: session.data.followers,
              dailyTasksOptIn: !!session.data.daily
            })
          })
          const result = await resp.json()
          
          if (result.success) {
            await bot.sendMessage(chatId, '✅ Отлично! Все данные собраны. Твой аккаунт привязан и верифицирован. Можешь возвращаться на сайт! 🎉')
          } else {
            await bot.sendMessage(chatId, `❌ Не удалось завершить: ${result.error || 'ошибка'}\n\nПопробуй еще раз или обратись в поддержку.`)
          }
        } catch (e) {
          await bot.sendMessage(chatId, '⚠️ Сервис временно недоступен, попробуй позже.')
        } finally {
          sessions.delete(chatId)
        }
      } else {
        // Еще не все собрано - отправляем ответ AI с подсказкой
        const missingHint = getMissingFields(session.data)
        await bot.sendMessage(chatId, response + (missingHint ? missingHint : ''))
      }
    })

    console.log('✅ Telegram бот инициализирован с OpenAI поддержкой')
    return bot
  } catch (error) {
    console.error('❌ Ошибка создания Telegram бота:', error)
    isInitialized = false
    botInstance = null
    return null
  }
}

// Инициализация происходит через telegram-init-server.ts