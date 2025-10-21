# Business Components - БИЗНЕС-КОМПОНЕНТЫ

## 💼 ЛОГИКА (МОЖНО МЕНЯТЬ CURSOR'ОМ):
- `UserProfile.tsx` - Профиль пользователя
- `OrderForm.tsx` - Форма заказа
- `PaymentForm.tsx` - Форма оплаты
- `Dashboard.tsx` - Дашборд
- `Analytics.tsx` - Аналитика

## 📋 ПРАВИЛА:
- ✅ Можно менять логику (props, handlers, state)
- ✅ Можно менять Tailwind классы
- ✅ Можно менять layout и spacing
- ✅ Можно менять цвета и анимации

## 🔧 ИСПОЛЬЗОВАНИЕ:
```tsx
import { UserProfile } from '@/components/business/UserProfile'

// ✅ Правильно - можно менять все
<UserProfile 
  user={user} 
  onUpdate={handleUpdate}
  className="bg-blue-500" // Можно!
/>
```

