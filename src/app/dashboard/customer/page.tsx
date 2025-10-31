'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Container from '@/components/ui/container'
import { OrderCard } from '@/components/business/OrderCard'
import { BalanceCard } from '@/components/payment/BalanceCard'
import { ArrowLeft, Plus, Target, DollarSign, Users, TrendingUp, Settings, LogOut } from 'lucide-react'

interface Order {
  id: string
  title: string
  description: string
  targetAudience: string
  reward: number
  processedImageUrl?: string
  qrCodeUrl?: string
  deadline?: string
  customer?: {
    name: string
    level: string
  }
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?role=customer&userId=temp-customer')
      const result = await response.json()
      
      if (result.success) {
        setOrders(result.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      {/* Header */}
      <header className="border-b border-mb-gray/20 bg-mb-black/80 backdrop-blur-sm">
        <Container className="py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-mb-turquoise to-mb-gold rounded-lg flex items-center justify-center mb-text-glow">
              <span className="text-mb-black font-bold text-sm">MB</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-mb-turquoise to-mb-gold bg-clip-text text-transparent">
              MB-TRUST
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать, Иван!</h1>
          <p className="text-mb-gray">Управляйте своими заданиями и отслеживайте результаты</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Активные задания</p>
                  <p className="text-2xl font-bold text-mb-turquoise">3</p>
                </div>
                <Target className="h-8 w-8 text-mb-turquoise" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Потрачено</p>
                  <p className="text-2xl font-bold text-mb-gold">2,400₽</p>
                </div>
                <DollarSign className="h-8 w-8 text-mb-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Исполнители</p>
                  <p className="text-2xl font-bold text-mb-white">12</p>
                </div>
                <Users className="h-8 w-8 text-mb-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">CTR</p>
                  <p className="text-2xl font-bold text-mb-turquoise">3.2%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-mb-turquoise" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/customer/create-order">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Создать задание
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Пополнить баланс
            </Button>
            <Link href="/dashboard/customer/orders">
              <Button size="lg" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Мои задания
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Последние задания</h2>
          {orders.length === 0 ? (
            <Card className="border-0 shadow-lg text-center py-12">
              <CardContent>
                <Target className="h-16 w-16 text-mb-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">У вас пока нет заданий</h3>
                <p className="text-mb-gray mb-6">
                  Создайте первое задание, чтобы начать работу с исполнителями.
                </p>
                <Link href="/dashboard/customer/create-order">
                  <Button>
                    Создать задание
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAccept={() => {}} 
                  compact 
                  hideAcceptButton={true}
                />
              ))}
            </div>
          )}
        </div>
        
  {/* Balance */}
        <BalanceCard 
          balance={7600} 
          reservedBalance={1500} 
          totalEarned={10000}
          role="customer"
        />
      </Container>
    </div>
  )
}