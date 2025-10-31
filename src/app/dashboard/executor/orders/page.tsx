'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, DollarSign, MapPin, Users, Calendar, Eye } from 'lucide-react'

interface Order {
  id: string
  title: string
  description: string
  region: string
  socialNetwork: string
  status: string
  createdAt: string
  customer: {
    name: string
  }
}

// Added reward fields after schema change
interface OrderWithReward extends Order {
  reward?: number;
  totalReward?: number;
}

export default function AvailableOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithReward[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=PENDING')
      const result = await response.json()
      
      if (result.success) {
        setOrders(result.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const takeOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          executorId: 'test-executor-1', // Используем ID тестового исполнителя из create-test-accounts.mjs
          description: 'Взял задание в работу'
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Задание взято в работу!')
        fetchOrders() // Обновляем список
      } else {
        alert('Ошибка: ' + result.error)
      }
    } catch (error) {
      console.error('Error taking order:', error)
      alert('Произошла ошибка при взятии задания')
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.socialNetwork === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black text-mb-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mb-turquoise mx-auto mb-4"></div>
          <p className="text-mb-gray">Загрузка заданий...</p>
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
          <Badge variant="gold" className="text-sm">
            Исполнитель
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Доступные задания</h1>
          <p className="text-mb-gray">Выберите подходящее задание и начните зарабатывать</p>
        </div>

        {/* Фильтры */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={filter === 'INSTAGRAM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('INSTAGRAM')}
            >
              📷 Instagram
            </Button>
            <Button
              variant={filter === 'TELEGRAM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('TELEGRAM')}
            >
              ✈️ Telegram
            </Button>
            <Button
              variant={filter === 'VKONTAKTE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('VKONTAKTE')}
            >
              🔵 ВКонтакте
            </Button>
            <Button
              variant={filter === 'YOUTUBE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('YOUTUBE')}
            >
              📺 YouTube
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-lg text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 text-mb-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет доступных заданий</h3>
              <p className="text-mb-gray mb-6">
                {filter === 'all' 
                  ? 'В данный момент нет доступных заданий' 
                  : `Нет заданий для ${filter}`
                }
              </p>
              {filter !== 'all' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  Показать все задания
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{order.title}</CardTitle>
                      <CardDescription className="text-mb-gray mb-4">
                        {order.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Доступно</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-gold/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-mb-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Оплата</p>
                          <p className="font-semibold text-mb-gold">{(order.reward ?? (order as OrderWithReward).totalReward) ?? 0}₽</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Регион</p>
                          <p className="font-semibold">{order.region}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Заказчик</p>
                          <p className="font-semibold">{order.customer.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getSocialNetworkIcon(order.socialNetwork)}</span>
                        <span className="font-medium">{order.socialNetwork}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-mb-gray" />
                        <span className="text-sm text-mb-gray">
                          Создано: {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>

                      <div className="bg-mb-black/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-mb-turquoise">Что нужно сделать:</h4>
                        <ul className="text-sm space-y-1 text-mb-gray">
                          <li>• Разместить сторис в {order.socialNetwork}</li>
                          <li>• Добавить QR-код или ссылку</li>
                          <li>• Сделать скриншот размещения</li>
                          <li>• Дождаться проверки модератора</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <Button 
                      onClick={() => takeOrder(order.id)}
                      className="flex-1"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Взять задание
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Подробнее
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

