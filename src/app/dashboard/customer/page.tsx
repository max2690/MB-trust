'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Container from '@/components/ui/container'
import { OrderCard } from '@/components/business/OrderCard'
import { ArrowLeft, Plus, Target, DollarSign, Users, TrendingUp, Settings, LogOut } from 'lucide-react'

export default function CustomerDashboardPage() {
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <OrderCard key={i} order={{
                id: String(i),
                title: `Промо для интернет-магазина #${i}`,
                description: 'Сторис с промокодом для интернет-магазина',
                targetAudience: '18-34',
                reward: 500,
                processedImageUrl: '',
                qrCodeUrl: '',
                deadline: '',
                customer: { name: 'Вы', level: 'VERIFIED' }
              } as any} onAccept={() => {}} compact />
            ))}
          </div>
  </div>
        
  {/* Balance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Баланс</CardTitle>
            <CardDescription>Управляйте своими средствами</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-mb-gray">Доступно</p>
                <p className="text-3xl font-bold text-mb-gold">7,600₽</p>
              </div>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Пополнить
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-mb-gray">Зарезервировано:</span>
                <span className="text-mb-white">1,500₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mb-gray">Всего пополнено:</span>
                <span className="text-mb-white">10,000₽</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}