import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, DollarSign, Target, Shield, Zap, Play, Download, Smartphone } from 'lucide-react'

export default function HomePage() {
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
            <Link href="/quick-access">
              <Button variant="ghost" className="text-mb-turquoise">
                🚀 Быстрый доступ
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Начать</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center mb-bg-animated">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge variant="gold" className="mb-6 text-sm px-4 py-2 animate-float">
            💎 Доверие — новая валюта
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-8 mb-gradient-text mb-text-glow animate-slide-up">
            Доверие — новая валюта
          </h1>
          <p className="text-xl text-mb-gray mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            MB-TRUST помогает создателям и брендам честно договариваться и зарабатывать: 
            размещай задания, выбирай исполнителей, фиксируй результат. Прозрачно. Без лишних слов.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8 animate-scale-in">
            <Link href="/auth/signup?role=executor">
              <Button size="xl" className="w-full sm:w-auto">
                Заработать сейчас
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup?role=customer">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Разместить задание
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-base text-mb-gray/80 animate-fade-in">
            Бесплатно до 3 задач • Мгновенная регистрация • Вывод на карту/СБП
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-xl overflow-hidden bg-mb-black/50 border border-mb-gray/30 shadow-lg shadow-mb-turquoise/10 p-8">
            <div className="flex items-center justify-center mb-4">
              <Play className="h-16 w-16 text-mb-turquoise mb-text-glow" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Посмотри как это работает</h3>
            <p className="text-mb-gray mb-6">
              Видео от Sora покажет вам всю мощь платформы MB-TRUST
            </p>
            <div className="relative rounded-lg overflow-hidden">
              <video 
                className="w-full h-auto rounded-lg"
                controls
                poster="/videos/poster.jpg"
                preload="metadata"
              >
                <source src="/videos/mb-trust-hero-video.mp4" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-mb-black/50 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Уже доверяют MB-TRUST</h2>
          <p className="text-mb-gray">
            Более <span className="text-mb-turquoise font-bold">12,000</span> создателей и <span className="text-mb-gold font-bold">1,800</span> брендов
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-mb-gray/10 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-mb-gray/20 rounded-lg mx-auto mb-4"></div>
              <p className="text-sm text-mb-gray">Партнер {i}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
          <p className="text-mb-gray max-w-2xl mx-auto">
            Простая и прозрачная система для всех участников экосистемы
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border border-mb-gray/30 shadow-lg shadow-mb-turquoise/10 hover:shadow-glow hover:border-mb-turquoise/50 transition-all duration-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-mb-turquoise/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-mb-turquoise" />
              </div>
              <CardTitle className="text-xl">1. Выбираешь роль</CardTitle>
              <CardDescription>
                Заказчик или исполнитель — определяешь свою позицию в экосистеме
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-mb-gray">
                <li>• Заказчик: размещает задания</li>
                <li>• Исполнитель: выполняет задания</li>
                <li>• Можно совмещать роли</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-mb-gray/30 shadow-lg shadow-mb-turquoise/10 hover:shadow-glow hover:border-mb-turquoise/50 transition-all duration-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-mb-gold/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="h-6 w-6 text-mb-gold" />
              </div>
              <CardTitle className="text-xl">2. Создаёшь задачу</CardTitle>
              <CardDescription>
                Формат, площадки, дедлайн, бюджет — всё прозрачно
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-mb-gray">
                <li>• Чёткое техническое задание</li>
                <li>• Выбор площадок (TG, VK, IG, YT)</li>
                <li>• Фиксированный бюджет</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-mb-gray/30 shadow-lg shadow-mb-turquoise/10 hover:shadow-glow hover:border-mb-turquoise/50 transition-all duration-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-mb-turquoise/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-mb-turquoise" />
              </div>
              <CardTitle className="text-xl">3. Фиксируешь результат</CardTitle>
              <CardDescription>
                Ссылки, скриншоты, автопроверки — получаешь оплату
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-mb-gray">
                <li>• Автоматическая проверка</li>
                <li>• Прозрачная аналитика</li>
                <li>• Мгновенные выплаты</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features for Customers */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Для заказчиков</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-mb-turquoise rounded-full flex items-center justify-center mt-1">
                  <Target className="h-3 w-3 text-mb-black" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Прозрачные задания</h3>
                  <p className="text-mb-gray text-sm">Форматы, ссылки, площадки (TG, VK, IG, YouTube, WhatsApp и др.)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-mb-turquoise rounded-full flex items-center justify-center mt-1">
                  <Shield className="h-3 w-3 text-mb-black" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Фрод-фильтр</h3>
                  <p className="text-mb-gray text-sm">Исключаем «пустые» сторис/ботов, следим за уникальностью аудитории</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-mb-turquoise rounded-full flex items-center justify-center mt-1">
                  <Zap className="h-3 w-3 text-mb-black" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Дашборд эффективности</h3>
                  <p className="text-mb-gray text-sm">Клики, покрытия, стоимость действия</p>
                </div>
              </div>
            </div>
            <Link href="/auth/signup?role=customer" className="inline-block mt-6">
              <Button size="lg">Разместить задание</Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-mb-turquoise/10 to-mb-gold/10 rounded-xl p-8">
            <div className="space-y-4">
              <div className="bg-mb-black/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Пример задания</h4>
                <p className="text-sm text-mb-gray">Сторис с промокодом для интернет-магазина</p>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="secondary">Instagram</Badge>
                  <span className="text-mb-gold font-bold">500₽</span>
                </div>
              </div>
              <div className="bg-mb-black/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Результат</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mb-gray">Клики:</span>
                  <span className="text-mb-turquoise font-bold">127</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mb-gray">CTR:</span>
                  <span className="text-mb-gold font-bold">3.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Executors */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gradient-to-br from-mb-gold/10 to-mb-turquoise/10 rounded-xl p-8 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="bg-mb-black/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Уровни доверия</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mb-gray">Новичок:</span>
                    <span className="text-mb-turquoise font-bold">40%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mb-gray">Проверенный:</span>
                    <span className="text-mb-turquoise font-bold">50%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mb-gray">Топ:</span>
                    <span className="text-mb-gold font-bold">80%</span>
                  </div>
                </div>
              </div>
              <div className="bg-mb-black/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Заработок</h4>
                <div className="text-2xl font-bold text-mb-gold mb-1">2,400₽</div>
                <p className="text-sm text-mb-gray">за последние 7 дней</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold mb-6">Для исполнителей</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-mb-gold rounded-full flex items-center justify-center mt-1">
                  <Target className="h-3 w-3 text-mb-black" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Выбирай подходящие задачи</h3>
                  <p className="text-mb-gray text-sm">По платформам и цене</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-mb-gold rounded-full flex items-center justify-center mt-1">
                  <Zap className="h-3 w-3 text-mb-black" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Расти по уровням доверия</h3>
                  <p className="text-mb-gray text-sm">KYC, история сделок, рейтинг. Больше доверия — больше доход</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-mb-gold rounded-full flex items-center justify-center mt-1">
                  <DollarSign className="h-3 w-3 text-mb-black" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Мгновенные выплаты</h3>
                  <p className="text-mb-gray text-sm">СБП/карта, самозанятые/ИП</p>
                </div>
              </div>
            </div>
            <Link href="/auth/signup?role=executor" className="inline-block mt-6">
              <Button size="lg" variant="gold">Заработать сейчас</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Download Apps */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Скачай приложение</h2>
          <p className="text-mb-gray max-w-2xl mx-auto">
            Получи доступ к заданиям и заработку прямо с телефона
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="#" className="flex items-center space-x-3 bg-mb-black/50 border border-mb-gray/20 rounded-lg px-6 py-4 hover:shadow-glow transition-all duration-200">
            <Smartphone className="h-8 w-8 text-mb-turquoise" />
            <div className="text-left">
              <div className="text-sm text-mb-gray">Скачать для</div>
              <div className="font-semibold">Android</div>
            </div>
          </Link>
          
          <Link href="#" className="flex items-center space-x-3 bg-mb-black/50 border border-mb-gray/20 rounded-lg px-6 py-4 hover:shadow-glow transition-all duration-200">
            <Smartphone className="h-8 w-8 text-mb-turquoise" />
            <div className="text-left">
              <div className="text-sm text-mb-gray">Скачать для</div>
              <div className="font-semibold">iOS</div>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-mb-gray mb-8">
            Присоединяйтесь к революции в маркетинге уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customer/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Дашборд заказчика
              </Button>
            </Link>
            <Link href="/executor/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Дашборд исполнителя
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Админ-панель
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mb-gray/20 bg-mb-black/50 py-12">
        <div className="container mx-auto px-4 text-center text-mb-gray">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-mb-turquoise to-mb-gold rounded flex items-center justify-center">
              <span className="text-mb-black font-bold text-xs">MB</span>
            </div>
            <span className="font-semibold">MB-TRUST</span>
          </div>
          <p>&copy; 2024 MB-TRUST. Все права защищены.</p>
          <div className="mt-4 space-x-6 text-sm">
            <Link href="/privacy" className="hover:text-mb-turquoise">Политика конфиденциальности</Link>
            <Link href="/terms" className="hover:text-mb-turquoise">Условия использования</Link>
            <Link href="/contact" className="hover:text-mb-turquoise">Контакты</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
