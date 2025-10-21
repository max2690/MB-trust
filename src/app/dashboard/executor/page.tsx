import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, DollarSign, Users, TrendingUp, Settings, LogOut, Star } from 'lucide-react'

export default function ExecutorDashboardPage() {
  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      {/* Header */}
      <header className="border-b border-mb-gray/20 bg-mb-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Добро пожаловать, Анна!</h1>
              <p className="text-mb-gray">Выполняйте задания и зарабатывайте</p>
            </div>
            <div className="text-right">
              <Badge variant="gold" className="mb-2">Уровень: Проверенный</Badge>
              <p className="text-sm text-mb-gray">Доход: 50% от задания</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Активные задания</p>
                  <p className="text-2xl font-bold text-mb-turquoise">5</p>
                </div>
                <Target className="h-8 w-8 text-mb-turquoise" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Заработано</p>
                  <p className="text-2xl font-bold text-mb-gold">2,400₽</p>
                </div>
                <DollarSign className="h-8 w-8 text-mb-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Выполнено</p>
                  <p className="text-2xl font-bold text-mb-white">24</p>
                </div>
                <Star className="h-8 w-8 text-mb-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mb-gray">Рейтинг</p>
                  <p className="text-2xl font-bold text-mb-turquoise">4.8</p>
                </div>
                <TrendingUp className="h-8 w-8 text-mb-turquoise" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Прогресс уровня</CardTitle>
            <CardDescription>Растите по уровням доверия для увеличения дохода</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mb-gray">Текущий уровень:</span>
                <Badge variant="secondary">Проверенный (50%)</Badge>
              </div>
              <div className="w-full bg-mb-gray/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-mb-turquoise to-mb-gold h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-mb-gray">Выполнено заданий:</span>
                  <span className="text-mb-white">24/30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mb-gray">До следующего уровня:</span>
                  <span className="text-mb-turquoise">6 заданий</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Tasks */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Доступные задания</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-glow transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Промо для интернет-магазина #{i}</h3>
                      <p className="text-sm text-mb-gray mb-2">Сторис с промокодом для интернет-магазина</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge variant="secondary">Instagram</Badge>
                        <span className="text-mb-gray">Дедлайн: <span className="text-mb-white">2 дня</span></span>
                        <span className="text-mb-gray">Регион: <span className="text-mb-white">Москва</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-mb-gold mb-2">250₽</p>
                      <p className="text-sm text-mb-gray">Ваш доход: 125₽</p>
                      <Link href="/dashboard/executor/orders">
                        <Button className="mt-2" size="sm">
                          Взять задание
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Balance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Баланс</CardTitle>
            <CardDescription>Управляйте своими заработками</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-mb-gray">Доступно к выводу</p>
                <p className="text-3xl font-bold text-mb-gold">2,400₽</p>
              </div>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Вывести
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-mb-gray">В обработке:</span>
                <span className="text-mb-white">0₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mb-gray">Всего заработано:</span>
                <span className="text-mb-white">2,400₽</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}