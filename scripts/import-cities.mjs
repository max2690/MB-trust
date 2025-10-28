import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const russianCities = [
  // Москва и область
  { name: 'Москва', region: 'Московская область', country: 'Россия' },
  { name: 'Зеленоград', region: 'Московская область', country: 'Россия' },
  { name: 'Химки', region: 'Московская область', country: 'Россия' },
  { name: 'Коломна', region: 'Московская область', country: 'Россия' },
  
  // Санкт-Петербург и область
  { name: 'Санкт-Петербург', region: 'Ленинградская область', country: 'Россия' },
  
  // Крупные города
  { name: 'Новосибирск', region: 'Новосибирская область', country: 'Россия' },
  { name: 'Екатеринбург', region: 'Свердловская область', country: 'Россия' },
  { name: 'Казань', region: 'Республика Татарстан', country: 'Россия' },
  { name: 'Нижний Новгород', region: 'Нижегородская область', country: 'Россия' },
  { name: 'Челябинск', region: 'Челябинская область', country: 'Россия' },
  { name: 'Самара', region: 'Самарская область', country: 'Россия' },
  { name: 'Омск', region: 'Омская область', country: 'Россия' },
  { name: 'Красноярск', region: 'Красноярский край', country: 'Россия' },
  { name: 'Ростов-на-Дону', region: 'Ростовская область', country: 'Россия' },
  { name: 'Уфа', region: 'Республика Башкортостан', country: 'Россия' },
  { name: 'Воронеж', region: 'Воронежская область', country: 'Россия' },
  { name: 'Пермь', region: 'Пермский край', country: 'Россия' },
  { name: 'Волгоград', region: 'Волгоградская область', country: 'Россия' },
  { name: 'Краснодар', region: 'Краснодарский край', country: 'Россия' },
  { name: 'Саратов', region: 'Саратовская область', country: 'Россия' },
  { name: 'Тюмень', region: 'Тюменская область', country: 'Россия' },
  { name: 'Калининград', region: 'Калининградская область', country: 'Россия' },
  { name: 'Хабаровск', region: 'Хабаровский край', country: 'Россия' },
  { name: 'Архангельск', region: 'Архангельская область', country: 'Россия' },
  { name: 'Мурманск', region: 'Мурманская область', country: 'Россия' },
  { name: 'Белгород', region: 'Белгородская область', country: 'Россия' },
  { name: 'Брянск', region: 'Брянская область', country: 'Россия' },
  { name: 'Владивосток', region: 'Приморский край', country: 'Россия' },
  { name: 'Владимир', region: 'Владимирская область', country: 'Россия' },
  { name: 'Вологда', region: 'Вологодская область', country: 'Россия' },
  { name: 'Ижевск', region: 'Удмуртская Республика', country: 'Россия' },
  { name: 'Иркутск', region: 'Иркутская область', country: 'Россия' },
  { name: 'Кемерово', region: 'Кемеровская область', country: 'Россия' },
  { name: 'Киров', region: 'Кировская область', country: 'Россия' },
  { name: 'Кострома', region: 'Костромская область', country: 'Россия' },
  { name: 'Курск', region: 'Курская область', country: 'Россия' },
  { name: 'Липецк', region: 'Липецкая область', country: 'Россия' },
  { name: 'Магадан', region: 'Магаданская область', country: 'Россия' },
  { name: 'Орел', region: 'Орловская область', country: 'Россия' },
  { name: 'Пенза', region: 'Пензенская область', country: 'Россия' },
  { name: 'Псков', region: 'Псковская область', country: 'Россия' },
  { name: 'Рязань', region: 'Рязанская область', country: 'Россия' },
  { name: 'Саранск', region: 'Республика Мордовия', country: 'Россия' },
  { name: 'Смоленск', region: 'Смоленская область', country: 'Россия' },
  { name: 'Ставрополь', region: 'Ставропольский край', country: 'Россия' },
  { name: 'Тамбов', region: 'Тамбовская область', country: 'Россия' },
  { name: 'Тверь', region: 'Тверская область', country: 'Россия' },
  { name: 'Томск', region: 'Томская область', country: 'Россия' },
  { name: 'Тула', region: 'Тульская область', country: 'Россия' },
  { name: 'Ульяновск', region: 'Ульяновская область', country: 'Россия' },
  { name: 'Чебоксары', region: 'Чувашская Республика', country: 'Россия' },
  { name: 'Чита', region: 'Забайкальский край', country: 'Россия' },
  { name: 'Якутск', region: 'Республика Саха (Якутия)', country: 'Россия' },
  { name: 'Ярославль', region: 'Ярославская область', country: 'Россия' }
];

async function importCities() {
  try {
    console.log('🚀 Импорт городов России...');
    
    let imported = 0;
    
    for (const city of russianCities) {
      await prisma.city.upsert({
        where: {
          name_region: {
            name: city.name,
            region: city.region
          }
        },
        update: {},
        create: {
          name: city.name,
          region: city.region,
          country: city.country,
          isActive: true
        }
      });
      imported++;
    }
    
    console.log(`✅ Импортировано ${imported} городов`);
    
  } catch (error) {
    console.error('❌ Ошибка импорта городов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCities();

