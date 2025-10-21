import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Mail, Lock, Phone, MapPin } from 'lucide-react'

export default function CustomerSignUpPage() {
  return (
    <div className="min-h-screen bg-mb-black text-mb-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/auth/signup" className="inline-flex items-center text-sm text-mb-gray hover:text-mb-turquoise mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к выбору роли
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-mb-turquoise to-mb-gold rounded-lg flex items-center justify-center mb-text-glow">
              <span className="text-mb-black font-bold text-sm">MB</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-mb-turquoise to-mb-gold bg-clip-text text-transparent">
              MB-TRUST
            </span>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-mb-turquoise/20 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-mb-turquoise" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Регистрация заказчика</h1>
          <p className="text-mb-gray">Создайте аккаунт для размещения заданий</p>
        </div>

        {/* Registration Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Заполните данные</CardTitle>
            <CardDescription className="text-center">
              Все поля обязательны для заполнения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-mb-white">Имя и фамилия</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                <Input 
                  type="text" 
                  placeholder="Иван Иванов" 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-mb-white">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                <Input 
                  type="tel" 
                  placeholder="+7 (999) 123-45-67" 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-mb-white">Email (необязательно)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                <Input 
                  type="email" 
                  placeholder="ivan@example.com" 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-mb-white">Регион</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                <Input 
                  type="text" 
                  placeholder="Москва" 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-mb-white">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                <Input 
                  type="password" 
                  placeholder="Минимум 8 символов" 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-mb-white">Подтвердите пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                <Input 
                  type="password" 
                  placeholder="Повторите пароль" 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-mb-turquoise/10 rounded-lg p-4">
              <h4 className="font-semibold text-mb-turquoise mb-2">Что вас ждет:</h4>
              <ul className="text-sm text-mb-gray space-y-1">
                <li>• Минимальный депозит: <Badge variant="gold" className="ml-1">1000₽</Badge></li>
                <li>• Стоимость задания: <Badge variant="secondary" className="ml-1">от 100₽</Badge></li>
                <li>• Комиссия платформы: <Badge variant="secondary" className="ml-1">20%</Badge></li>
                <li>• Автоматический подбор исполнителей</li>
                <li>• Детальная аналитика результатов</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <input type="checkbox" className="rounded border-mb-gray/20 bg-mb-black/50 text-mb-turquoise focus:ring-mb-turquoise" />
              <span className="text-mb-gray">
                Я согласен с <Link href="/terms" className="text-mb-turquoise hover:underline">условиями использования</Link> и <Link href="/privacy" className="text-mb-turquoise hover:underline">политикой конфиденциальности</Link>
              </span>
            </div>

            <Button className="w-full">
              Создать аккаунт заказчика
            </Button>

            <div className="text-center text-sm text-mb-gray">
              <p>Уже есть аккаунт? <Link href="/auth/signin" className="text-mb-turquoise hover:underline">Войти</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}