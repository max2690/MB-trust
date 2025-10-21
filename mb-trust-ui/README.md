# MB-TRUST UI Library

Библиотека UI компонентов для платформы MB-TRUST.

## Установка

```bash
npm install mb-trust-ui
```

## Использование

```tsx
import { Button, Card, Input, Badge } from 'mb-trust-ui';
import { OrderCard, CustomerImageUpload } from 'mb-trust-ui/business';

function MyApp() {
  return (
    <div>
      <Card>
        <h1>MB-TRUST</h1>
        <Button>Создать заказ</Button>
      </Card>
    </div>
  );
}
```

## Компоненты

### UI Components
- `Button` - Кнопки с различными вариантами
- `Card` - Карточки контента
- `Input` - Поля ввода
- `Badge` - Значки и метки

### Business Components
- `OrderCard` - Карточка заказа для исполнителей
- `CustomerImageUpload` - Загрузка изображений для заказчиков
- `ScreenshotUpload` - Загрузка скриншотов
- `ExecutorDashboard` - Дашборд исполнителя
- `CreateOrderForm` - Форма создания заказа

## Стили

Используйте CSS переменные для кастомизации:

```css
:root {
  --mb-black: 11 11 15;
  --mb-white: 245 245 245;
  --mb-turquoise: 0 255 255;
  --mb-gold: 255 215 0;
}
```

## Лицензия

MIT

