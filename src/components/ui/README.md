# UI Components - ЗАФИКСИРОВАННЫЕ КОМПОНЕНТЫ

⚠️ **ВНИМАНИЕ**: Эти компоненты НЕ ДОЛЖНЫ изменяться Cursor'ом!

## Правила:
- ✅ Можно менять логику (props, handlers, state)
- ❌ НЕЛЬЗЯ менять Tailwind классы
- ❌ НЕЛЬЗЯ менять layout и spacing
- ❌ НЕЛЬЗЯ менять цвета и анимации

## Компоненты:
- `button.tsx` - Кнопки с фиксированным дизайном
- `card.tsx` - Карточки с фиксированным дизайном  
- `input.tsx` - Поля ввода с фиксированным дизайном
- `badge.tsx` - Бейджи с фиксированным дизайном

## Использование:
```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ✅ Правильно - меняем только логику
<Button onClick={handleClick} disabled={isLoading}>
  {isLoading ? 'Загрузка...' : 'Отправить'}
</Button>

// ❌ Неправильно - не меняем className
<Button className="bg-red-500"> // НЕ ДЕЛАТЬ!
```

