"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Container from '@/components/ui/container'
import { OrderCard } from '@/components/business/OrderCard'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Eye, Users, DollarSign, Calendar, Target } from 'lucide-react'

import type { OrderUI } from '@/lib/ui-types'

type Order = OrderUI & {
  clickCount?: number
  completedExecutions?: number
  qrCodeDataURL?: string
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
        <Container className="py-4 flex items-center justify-between">
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
        </Container>
      </header>

      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Мои задания</h1>
          <p className="text-mb-gray">Управляйте своими заданиями и отслеживайте результаты</p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-0 shadow-lg text-center">
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
              <OrderCard key={order.id} order={order} onAccept={() => { /* no-op in list view */ }} compact />
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

