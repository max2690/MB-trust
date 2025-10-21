'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TestLinksPage() {
  const router = useRouter();

  const quickLinks = [
    {
      title: '🔥 Супер-админ панель',
      description: 'Прямой доступ к панели супер-админа',
      url: '/admin-god/dashboard',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: '👨‍💼 Модератор панель',
      description: 'Прямой доступ к панели модератора',
      url: '/admin-moderator/dashboard',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '🔐 Супер-админ вход',
      description: 'Страница входа супер-админа (любой логин/пароль)',
      url: '/admin-god/login',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: '🔑 Модератор вход',
      description: 'Страница входа модератора (любой логин/пароль)',
      url: '/admin-moderator/login',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '🏠 Главная страница',
      description: 'Основная страница приложения',
      url: '/',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Тестовые ссылки MB-TRUST
          </h1>
          <p className="text-lg text-gray-600">
            Быстрый доступ ко всем разделам для тестирования
          </p>
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              ⚡ DEV MODE: Все проверки авторизации отключены!
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Любой логин/пароль проходит, верификация автоматическая
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{link.description}</p>
                <Button
                  onClick={() => router.push(link.url)}
                  className={`w-full text-white ${link.color}`}
                >
                  Перейти
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📋 Инструкция по тестированию:</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>1. Админ панели:</strong> Открываются сразу без логина</p>
            <p><strong>2. Страницы входа:</strong> Введи любой логин/пароль и нажми "Войти"</p>
            <p><strong>3. Верификация:</strong> Автоматически проходит в dev режиме</p>
            <p><strong>4. API:</strong> Все endpoints работают без токенов</p>
            <p><strong>5. Платежи:</strong> Заглушки YooKassa и Alfa-Bank</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Эти костыли работают только в development режиме
          </p>
        </div>
      </div>
    </div>
  );
}
