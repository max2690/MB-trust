import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DaData API для автодополнения адресов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q'); // Поисковый запрос
    const type = searchParams.get('type') || 'city'; // city, region, или address
    const filter = searchParams.get('filter') || 'RU'; // Фильтр по стране

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Если DaData API ключ не настроен, используем локальные данные
    if (!process.env.DADATA_API_KEY || process.env.DADATA_API_KEY === 'your_dadata_api_key_here') {
      return getLocalSuggestions(query, type, filter);
    }

    // API ключ настроен - делаем запрос к DaData
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.DADATA_API_KEY}`,
      },
      body: JSON.stringify({
        query: query,
        count: 10,
        from_bound: { value: type === 'city' ? 'city' : type === 'region' ? 'region' : 'address' },
        to_bound: { value: type === 'city' ? 'city' : type === 'region' ? 'region' : 'address' },
        restrict_value: true,
        locations: [{ country: filter }],
      }),
    });

    if (!response.ok) {
      // В случае ошибки используем локальные данные
      return getLocalSuggestions(query, type, filter);
    }

    const data = await response.json();
    type DaDataAddress = { value: string; data: { city?: string; region_with_type?: string; area_with_type?: string; country?: string } };
    
    // Форматируем ответ DaData
    const suggestions = (data.suggestions as DaDataAddress[]).map((s) => ({
      value: s.value,
      city: s.data.city || s.data.region_with_type,
      region: s.data.region_with_type || s.data.area_with_type,
      country: s.data.country,
      data: s.data
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Ошибка DaData API:', error);
    // В случае ошибки используем локальные данные
    return getLocalSuggestions(
      request.nextUrl.searchParams.get('q') || '',
      request.nextUrl.searchParams.get('type') || 'city',
      request.nextUrl.searchParams.get('filter') || 'RU'
    );
  }
}

// Локальные данные для городов (fallback если DaData недоступна)
function getLocalSuggestions(query: string, type: string, filter: string) {
  const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
    'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Красноярск',
    'Ростов-на-Дону', 'Уфа', 'Воронеж', 'Пермь', 'Волгоград',
    'Краснодар', 'Саратов', 'Тюмень', 'Калининград', 'Хабаровск',
    'Владивосток', 'Иркутск', 'Кемерово', 'Томск', 'Махачкала',
    'Астрахань', 'Оренбург', 'Киров', 'Липецк', 'Курск',
    'Тула', 'Сочи', 'Брянск', 'Белгород', 'Псков'
  ];

  const regions = [
    'Московская область', 'Ленинградская область', 'Краснодарский край',
    'Красноярский край', 'Приморский край', 'Свердловская область',
    'Ростовская область', 'Республика Татарстан', 'Самарская область',
    'Волгоградская область', 'Нижегородская область', 'Челябинская область',
    'Иркутская область', 'Хабаровский край', 'Ханты-Мансийский АО',
    'Алтайский край', 'Кемеровская область', 'Архангельская область',
    'Астраханская область', 'Белгородская область'
  ];

  let suggestions: string[] = [];
  
  if (type === 'city') {
    suggestions = cities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  } else if (type === 'region') {
    suggestions = regions.filter(region => 
      region.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }

  return NextResponse.json({
    suggestions: suggestions.map(s => ({
      value: s,
      city: type === 'city' ? s : null,
      region: type === 'region' ? s : null,
      country: 'Россия'
    }))
  });
}

