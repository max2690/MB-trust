import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "file:./prisma/dev.db" } },
});

async function initAdminData() {
  try {
    console.log('🚀 Инициализация админ-данных...');

    // 1. Создаем настройки платформ
    const platforms = [
      { platform: 'INSTAGRAM', basePrice: 100 },
      { platform: 'TELEGRAM', basePrice: 80 },
      { platform: 'VK', basePrice: 70 },
      { platform: 'TIKTOK', basePrice: 120 },
      { platform: 'WHATSAPP', basePrice: 90 },
      { platform: 'FACEBOOK', basePrice: 110 }
    ];

    for (const platform of platforms) {
      await prisma.platformSettings.upsert({
        where: { platform: platform.platform },
        update: { basePrice: platform.basePrice },
        create: platform
      });
    }
    console.log('✅ Настройки платформ созданы');

    // 2. Создаем настройки комиссий
    const commissions = [
      { level: 'NOVICE', executorRate: 0.4, platformRate: 0.6 },
      { level: 'VERIFIED', executorRate: 0.5, platformRate: 0.5 },
      { level: 'REFERRAL', executorRate: 0.6, platformRate: 0.4 },
      { level: 'TOP', executorRate: 0.8, platformRate: 0.2 }
    ];

    for (const commission of commissions) {
      await prisma.commissionSettings.upsert({
        where: { level: commission.level },
        update: { executorRate: commission.executorRate, platformRate: commission.platformRate },
        create: commission
      });
    }
    console.log('✅ Настройки комиссий созданы');

    // 3. Создаем основные города России
    const cities = [
      // Москва и область
      { name: 'Москва', region: 'Московская область' },
      { name: 'Химки', region: 'Московская область' },
      { name: 'Подольск', region: 'Московская область' },
      { name: 'Королёв', region: 'Московская область' },
      { name: 'Мытищи', region: 'Московская область' },
      
      // Санкт-Петербург и область
      { name: 'Санкт-Петербург', region: 'Ленинградская область' },
      { name: 'Колпино', region: 'Ленинградская область' },
      { name: 'Пушкин', region: 'Ленинградская область' },
      { name: 'Кронштадт', region: 'Ленинградская область' },
      
      // Крупные города
      { name: 'Новосибирск', region: 'Новосибирская область' },
      { name: 'Екатеринбург', region: 'Свердловская область' },
      { name: 'Нижний Новгород', region: 'Нижегородская область' },
      { name: 'Казань', region: 'Республика Татарстан' },
      { name: 'Челябинск', region: 'Челябинская область' },
      { name: 'Омск', region: 'Омская область' },
      { name: 'Самара', region: 'Самарская область' },
      { name: 'Ростов-на-Дону', region: 'Ростовская область' },
      { name: 'Уфа', region: 'Республика Башкортостан' },
      { name: 'Красноярск', region: 'Красноярский край' },
      { name: 'Воронеж', region: 'Воронежская область' },
      { name: 'Пермь', region: 'Пермский край' },
      { name: 'Волгоград', region: 'Волгоградская область' },
      { name: 'Краснодар', region: 'Краснодарский край' },
      { name: 'Саратов', region: 'Саратовская область' },
      { name: 'Тюмень', region: 'Тюменская область' },
      { name: 'Тольятти', region: 'Самарская область' },
      { name: 'Ижевск', region: 'Удмуртская Республика' },
      { name: 'Барнаул', region: 'Алтайский край' },
      { name: 'Ульяновск', region: 'Ульяновская область' },
      { name: 'Иркутск', region: 'Иркутская область' },
      { name: 'Хабаровск', region: 'Хабаровский край' },
      { name: 'Ярославль', region: 'Ярославская область' },
      { name: 'Владивосток', region: 'Приморский край' },
      { name: 'Махачкала', region: 'Республика Дагестан' },
      { name: 'Томск', region: 'Томская область' },
      { name: 'Оренбург', region: 'Оренбургская область' },
      { name: 'Кемерово', region: 'Кемеровская область' },
      { name: 'Новокузнецк', region: 'Кемеровская область' },
      { name: 'Рязань', region: 'Рязанская область' },
      { name: 'Набережные Челны', region: 'Республика Татарстан' },
      { name: 'Астрахань', region: 'Астраханская область' },
      { name: 'Пенза', region: 'Пензенская область' },
      { name: 'Липецк', region: 'Липецкая область' },
      { name: 'Тула', region: 'Тульская область' },
      { name: 'Киров', region: 'Кировская область' },
      { name: 'Чебоксары', region: 'Чувашская Республика' },
      { name: 'Калининград', region: 'Калининградская область' },
      { name: 'Брянск', region: 'Брянская область' },
      { name: 'Курск', region: 'Курская область' },
      { name: 'Иваново', region: 'Ивановская область' },
      { name: 'Магнитогорск', region: 'Челябинская область' },
      { name: 'Тверь', region: 'Тверская область' },
      { name: 'Ставрополь', region: 'Ставропольский край' },
      { name: 'Нижний Тагил', region: 'Свердловская область' },
      { name: 'Белгород', region: 'Белгородская область' },
      { name: 'Архангельск', region: 'Архангельская область' },
      { name: 'Владимир', region: 'Владимирская область' },
      { name: 'Сочи', region: 'Краснодарский край' },
      { name: 'Курган', region: 'Курганская область' },
      { name: 'Смоленск', region: 'Смоленская область' },
      { name: 'Калуга', region: 'Калужская область' },
      { name: 'Чита', region: 'Забайкальский край' },
      { name: 'Орёл', region: 'Орловская область' },
      { name: 'Волжский', region: 'Волгоградская область' },
      { name: 'Череповец', region: 'Вологодская область' },
      { name: 'Мурманск', region: 'Мурманская область' },
      { name: 'Сургут', region: 'Ханты-Мансийский автономный округ' },
      { name: 'Вологда', region: 'Вологодская область' },
      { name: 'Владикавказ', region: 'Республика Северная Осетия' },
      { name: 'Саранск', region: 'Республика Мордовия' },
      { name: 'Тамбов', region: 'Тамбовская область' },
      { name: 'Стерлитамак', region: 'Республика Башкортостан' },
      { name: 'Грозный', region: 'Чеченская Республика' },
      { name: 'Якутск', region: 'Республика Саха (Якутия)' },
      { name: 'Кострома', region: 'Костромская область' },
      { name: 'Комсомольск-на-Амуре', region: 'Хабаровский край' },
      { name: 'Петрозаводск', region: 'Республика Карелия' },
      { name: 'Таганрог', region: 'Ростовская область' },
      { name: 'Нижневартовск', region: 'Ханты-Мансийский автономный округ' },
      { name: 'Йошкар-Ола', region: 'Республика Марий Эл' },
      { name: 'Братск', region: 'Иркутская область' },
      { name: 'Новороссийск', region: 'Краснодарский край' },
      { name: 'Шахты', region: 'Ростовская область' },
      { name: 'Дзержинск', region: 'Нижегородская область' },
      { name: 'Орск', region: 'Оренбургская область' },
      { name: 'Ангарск', region: 'Иркутская область' },
      { name: 'Благовещенск', region: 'Амурская область' },
      { name: 'Псков', region: 'Псковская область' },
      { name: 'Бийск', region: 'Алтайский край' },
      { name: 'Прокопьевск', region: 'Кемеровская область' },
      { name: 'Хасавюрт', region: 'Республика Дагестан' },
      { name: 'Балаково', region: 'Саратовская область' },
      { name: 'Северодвинск', region: 'Архангельская область' },
      { name: 'Подольск', region: 'Московская область' },
      { name: 'Сыктывкар', region: 'Республика Коми' },
      { name: 'Норильск', region: 'Красноярский край' },
      { name: 'Златоуст', region: 'Челябинская область' },
      { name: 'Каменск-Уральский', region: 'Свердловская область' },
      { name: 'Электросталь', region: 'Московская область' },
      { name: 'Альметьевск', region: 'Республика Татарстан' },
      { name: 'Красногорск', region: 'Московская область' },
      { name: 'Петропавловск-Камчатский', region: 'Камчатский край' },
      { name: 'Сызрань', region: 'Самарская область' },
      { name: 'Назрань', region: 'Республика Ингушетия' },
      { name: 'Каспийск', region: 'Республика Дагестан' },
      { name: 'Миасс', region: 'Челябинская область' },
      { name: 'Люберцы', region: 'Московская область' },
      { name: 'Воткинск', region: 'Удмуртская Республика' },
      { name: 'Новочеркасск', region: 'Ростовская область' },
      { name: 'Серпухов', region: 'Московская область' },
      { name: 'Первоуральск', region: 'Свердловская область' },
      { name: 'Нефтеюганск', region: 'Ханты-Мансийский автономный округ' },
      { name: 'Щёлково', region: 'Московская область' },
      { name: 'Керчь', region: 'Республика Крым' },
      { name: 'Новошахтинск', region: 'Ростовская область' },
      { name: 'Ессентуки', region: 'Ставропольский край' },
      { name: 'Одинцово', region: 'Московская область' },
      { name: 'Раменское', region: 'Московская область' },
      { name: 'Реутов', region: 'Московская область' },
      { name: 'Жуковский', region: 'Московская область' },
      { name: 'Домодедово', region: 'Московская область' },
      { name: 'Севастополь', region: 'Город федерального значения Севастополь' }
    ];

    for (const city of cities) {
      await prisma.city.upsert({
        where: { 
          name_region: {
            name: city.name,
            region: city.region
          }
        },
        update: {},
        create: city
      });
    }
    console.log(`✅ Создано ${cities.length} городов России`);

    console.log('🎉 Инициализация админ-данных завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initAdminData();

