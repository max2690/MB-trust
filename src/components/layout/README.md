# Layout Components - КОМПОНЕНТЫ МАКЕТА

## 🎨 ДИЗАЙН (НЕ ТРОГАТЬ CURSOR'ОМ):
- `Header.tsx` - Шапка сайта
- `Footer.tsx` - Подвал сайта  
- `Navigation.tsx` - Навигация
- `Sidebar.tsx` - Боковая панель

## 📋 ПРАВИЛА:
- ✅ Можно менять логику (props, handlers, state)
- ❌ НЕЛЬЗЯ менять Tailwind классы
- ❌ НЕЛЬЗЯ менять layout и spacing
- ❌ НЕЛЬЗЯ менять цвета и анимации

## 🔧 ИСПОЛЬЗОВАНИЕ:
```tsx
import { Header } from '@/components/layout/Header'

// ✅ Правильно - меняем только логику
<Header user={user} onLogout={handleLogout} />

// ❌ Неправильно - не меняем className
<Header className="bg-red-500" /> // НЕ ДЕЛАТЬ!
```

