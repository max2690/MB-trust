'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, DollarSign, MapPin, Users, Calendar } from 'lucide-react'

export default function CreateOrderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    region: '',
    socialNetwork: 'INSTAGRAM',
    targetUrl: '',
    deadline: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
          customerId: 'temp-customer-id' // В реальном приложении будет из сессии
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/orders/${result.order.id}`)
      } else {
        alert('Ошибка создания заказа: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Произошла ошибка при создании заказа')
    } finally {
      setIsSubmitting(false)
    }
  }

  const socialNetworks = [
    { value: 'INSTAGRAM', label: 'Instagram', icon: '📷' },
    { value: 'TELEGRAM', label: 'Telegram', icon: '✈️' },
    { value: 'VKONTAKTE', label: 'ВКонтакте', icon: '🔵' },
    { value: 'YOUTUBE', label: 'YouTube', icon: '📺' },
    { value: 'TIKTOK', label: 'TikTok', icon: '🎵' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' }
  ]

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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Создать задание</h1>
            <p className="text-mb-gray">
              Опишите задачу, укажите бюджет и получите качественное выполнение
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-mb-turquoise" />
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название задания</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Размещение сторис с промокодом"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Подробно опишите, что нужно сделать..."
                    className="w-full px-3 py-2 bg-mb-black/50 border border-mb-gray/20 rounded-lg text-mb-white placeholder:text-mb-gray focus:outline-none focus:ring-2 focus:ring-mb-turquoise"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Целевая ссылка</label>
                  <Input
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    placeholder="https://example.com"
                    type="url"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-mb-gold" />
                  <span>Бюджет и условия</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Бюджет (₽)</label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="1000"
                    type="number"
                    min="100"
                    required
                  />
                  <p className="text-xs text-mb-gray mt-1">
                    Минимальный бюджет: 100₽. Платформа берет 20% комиссию.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Регион</label>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Москва, Россия"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Дедлайн</label>
                  <Input
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    type="datetime-local"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-mb-turquoise" />
                  <span>Платформа</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {socialNetworks.map((network) => (
                    <button
                      key={network.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, socialNetwork: network.value })}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.socialNetwork === network.value
                          ? 'border-mb-turquoise bg-mb-turquoise/10 shadow-glow'
                          : 'border-mb-gray/20 bg-mb-black/50 hover:border-mb-turquoise/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{network.icon}</div>
                        <div className="text-sm font-medium">{network.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-mb-turquoise/10 border border-mb-turquoise/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-mb-turquoise">Что происходит дальше?</h3>
              <ul className="text-sm space-y-1 text-mb-gray">
                <li>• Мы создадим уникальный QR-код для отслеживания кликов</li>
                <li>• Исполнители увидят ваше задание и смогут взять его в работу</li>
                <li>• После выполнения вы получите скриншот и статистику</li>
                <li>• Оплата происходит только после подтверждения результата</li>
              </ul>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать задание'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

