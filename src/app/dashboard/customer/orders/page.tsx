'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Eye, Users, DollarSign, Calendar, Target } from 'lucide-react'

interface Order {
  id: string
  title: string
  description: string
  budget: number
  region: string
  socialNetwork: string
  status: string
  clickCount: number
  completedExecutions: number
  qrCodeDataURL: string
  createdAt: string
  executions: Array<{
    id: string
    status: string
    executor: {
      name: string
      level: string
    }
  }>
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?customerId=temp-customer-id')
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, text: 'Ожидает' },
      IN_PROGRESS: { variant: 'default' as const, text: 'В работе' },
      COMPLETED: { variant: 'gold' as const, text: 'Завершен' },
      CANCELLED: { variant: 'destructive' as const, text: 'Отменен' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.text}</Badge>
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
          <p className="text-mb-gray">Загрузка заказов...</p>
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
          <Button onClick={() => router.push('/dashboard/customer/create-order')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать задание
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Мои задания</h1>
          <p className="text-mb-gray">Управляйте своими заданиями и отслеживайте результаты</p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-0 shadow-lg text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 text-mb-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Пока нет заданий</h3>
              <p className="text-mb-gray mb-6">
                Создайте первое задание и начните получать качественные результаты
              </p>
              <Button onClick={() => router.push('/dashboard/customer/create-order')}>
                <Plus className="h-4 w-4 mr-2" />
                Создать задание
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{order.title}</CardTitle>
                      <CardDescription className="text-mb-gray mb-4">
                        {order.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Бюджет</p>
                          <p className="font-semibold text-mb-gold">{order.budget}₽</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Исполнители</p>
                          <p className="font-semibold">{order.completedExecutions}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-mb-turquoise/20 rounded-lg flex items-center justify-center">
                          <Eye className="h-4 w-4 text-mb-turquoise" />
                        </div>
                        <div>
                          <p className="text-sm text-mb-gray">Клики</p>
                          <p className="font-semibold">{order.clickCount}</p>
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

                      {order.qrCodeDataURL && (
                        <div className="bg-mb-black/50 rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">QR-код для отслеживания</p>
                          <img 
                            src={order.qrCodeDataURL} 
                            alt="QR Code" 
                            className="w-24 h-24 mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {order.executions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-mb-gray/20">
                      <h4 className="font-semibold mb-3">Выполнения</h4>
                      <div className="space-y-2">
                        {order.executions.map((execution) => (
                          <div key={execution.id} className="flex items-center justify-between bg-mb-black/30 rounded-lg p-3">
                            <div>
                              <p className="font-medium">{execution.executor.name}</p>
                              <p className="text-sm text-mb-gray">Уровень: {execution.executor.level}</p>
                            </div>
                            {getStatusBadge(execution.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Подробнее
                    </Button>
                    {order.status === 'PENDING' && (
                      <Button variant="destructive">
                        Отменить
                      </Button>
                    )}
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

