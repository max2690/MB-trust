'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Mail, Lock, Phone, MapPin } from 'lucide-react'
import { TelegramVerification } from '@/components/verification/TelegramVerification'

export default function CustomerSignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    region: '',
    password: '',
    confirmPassword: ''
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'CUSTOMER',
          country: 'Россия'
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка регистрации')
      }

      setUserId(data.user.id)
      setIsRegistered(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = async () => {
    // После верификации перенаправляем на правильный дашборд
    if (userId) {
      try {
        const res = await fetch(`/api/users?userId=${userId}`)
        const data = await res.json()
        
        if (data.success && data.user) {
          // Проверяем роль и перенаправляем
          if (data.user.role === 'CUSTOMER') {
            router.push('/dashboard/customer')
          } else if (data.user.role === 'EXECUTOR') {
            router.push('/executor/available')
          } else {
            router.push('/auth/signin')
          }
          return
        }
      } catch (error) {
        console.error('Ошибка получения информации о пользователе:', error)
      }
    }
    
    // Fallback - перенаправляем на дашборд заказчика по умолчанию
    setTimeout(() => {
      router.push('/dashboard/customer')
    }, 2000)
  }
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
            {isRegistered && userId ? (
              <TelegramVerification userId={userId} onVerified={handleVerified} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-mb-red/10 border border-mb-red/50 rounded-lg p-3 text-sm text-mb-red">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-mb-white">Имя и фамилия</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-mb-gray" />
                    <Input 
                      type="text" 
                      placeholder="Иван Иванов" 
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      required
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
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
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      minLength={8}
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Создание аккаунта...' : 'Создать аккаунт заказчика'}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-mb-gray">
              <p>Уже есть аккаунт? <Link href="/auth/signin" className="text-mb-turquoise hover:underline">Войти</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}