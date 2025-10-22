'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, X, Eye, Users, DollarSign, Calendar } from 'lucide-react'

interface Execution {
  id: string
  status: string
  screenshotUrl: string
  description: string
  createdAt: string
  order: {
    id: string
    title: string
    description: string
    budget: number
    socialNetwork: string
  }
  executor: {
    id: string
    name: string
    level: string
    isVerified: boolean
  }
}

export default function ModerationPage() {
  const router = useRouter()
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExecutions()
  }, [])

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/moderate?status=PENDING_REVIEW')
      const result = await response.json()
      
      if (result.success) {
        setExecutions(result.executions)
      }
    } catch (error) {
      console.error('Error fetching executions:', error)
    } finally {
      setLoading(false)
    }
  }

  const moderateExecution = async (executionId: string, status: 'COMPLETED' | 'REJECTED', comment?: string) => {
    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executionId,
          status,
          moderatorId: 'temp-moderator-id', // В реальном приложении будет из сессии
          comment
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Выполнение ${status === 'COMPLETED' ? 'одобрено' : 'отклонено'}!`)
        fetchExecutions() // Обновляем список
      } else {
        alert('Ошибка: ' + result.error)
      }
    } catch (error) {
      console.error('Error moderating execution:', error)
      alert('Произошла ошибка при модерации')
    }
  }

  const getSocialNetworkIcon = (network: string) => {
    const icons = {
      INSTAGRAM: '📷',
      TELEGRAM: '✈️',
      VKONTAKTE: '🔵',
      YOUTUBE: '📺',
      TIKTOK: '🎵',
      WHATSAPP: '💬'
    }
    return icons[network as keyof typeof icons] || '📱'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black text-mb-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mb-turquoise mx-auto mb-4"></div>
          <p className="text-mb-gray">Загрузка заданий на модерацию...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      {/* Header */}
      <header className="border-b border-mb-gray/20 bg-mb-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-mb-turquoise to-mb-gold rounded-lg flex items-center justify-center mb-text-glow">
                <span className="text-mb-black font-bold text-sm">MB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-mb-turquoise to-mb-gold bg-clip-text text-transparent">
                MB-TRUST
              </span>
            </div>
          </div>
          <Badge variant="destructive" className="text-sm">
            Модератор
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Модерация заданий</h1>
          <p className="text-mb-gray">Проверяйте качество выполнения заданий</p>
        </div>

        {executions.length === 0 ? (
          <Card className="border-0 shadow-lg text-center py-12">
            <CardContent>
              <Check className="h-16 w-16 text-mb-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет заданий на модерацию</h3>
              <p className="text-mb-gray">
                Все задания проверены. Новые появятся по мере выполнения.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {executions.map((execution) => (
              <Card key={execution.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{execution.order.title}</CardTitle>
                      <CardDescription className="text-mb-gray mb-4">
                        {execution.order.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">На проверке</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Информация о задании */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-gold/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-mb-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Бюджет</p>
                          <p className="font-semibold text-mb-gold">{(execution.order as any).reward ?? (execution.order as any).totalReward ?? 0}₽</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Исполнитель</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{execution.executor.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {execution.executor.level}
                            </Badge>
                            {execution.executor.isVerified && (
                              <Badge variant="gold" className="text-xs">✓</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Выполнено</p>
                          <p className="font-semibold">
                            {new Date(execution.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getSocialNetworkIcon(execution.order.socialNetwork)}</span>
                        <span className="font-medium">{execution.order.socialNetwork}</span>
                      </div>
                    </div>

                    {/* Скриншот и описание */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Описание выполнения</h4>
                        <p className="text-mb-gray text-sm bg-mb-black/50 rounded-lg p-3">
                          {execution.description}
                        </p>
                      </div>

                      {execution.screenshotUrl && (
                        <div>
                          <h4 className="font-semibold mb-2">Скриншот</h4>
                          <div className="bg-mb-black/50 rounded-lg p-4">
                            <img 
                              src={execution.screenshotUrl} 
                              alt="Screenshot" 
                              className="w-full max-w-md mx-auto rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Критерии проверки */}
                  <div className="mt-6 pt-6 border-t border-mb-gray/20">
                    <h4 className="font-semibold mb-3">Критерии проверки</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mb-turquoise rounded-full"></div>
                          <span>Скриншот соответствует заданию</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mb-turquoise rounded-full"></div>
                          <span>QR-код или ссылка размещены</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mb-turquoise rounded-full"></div>
                          <span>Качество изображения хорошее</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mb-turquoise rounded-full"></div>
                          <span>Платформа соответствует заданию</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mb-turquoise rounded-full"></div>
                          <span>Нет нарушений правил</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-mb-turquoise rounded-full"></div>
                          <span>Сроки соблюдены</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Кнопки модерации */}
                  <div className="mt-6 flex space-x-3">
                    <Button 
                      onClick={() => moderateExecution(execution.id, 'COMPLETED')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Одобрить
                    </Button>
                    <Button 
                      onClick={() => moderateExecution(execution.id, 'REJECTED', 'Не соответствует требованиям')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

