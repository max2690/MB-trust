'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

interface Location {
  country: string | null;
  region: string | null;
  city: string | null;
}

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  initialLocation?: Location;
}

export function LocationSelector({ onLocationChange, initialLocation }: LocationSelectorProps) {
  const [scope, setScope] = useState<'country' | 'region' | 'city'>('country');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  
  const [countryInput, setCountryInput] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  // Инициализация
  useEffect(() => {
    if (initialLocation) {
      setSelectedCountry(initialLocation.country);
      setSelectedRegion(initialLocation.region);
      setSelectedCity(initialLocation.city);
      
      setCountryInput(initialLocation.country || 'Россия');
      setRegionInput(initialLocation.region || '');
      setCityInput(initialLocation.city || '');
      
      if (initialLocation.city) setScope('city');
      else if (initialLocation.region) setScope('region');
      else setScope('country');
    } else {
      setCountryInput('Россия');
    }
  }, [initialLocation]);

  // Основные регионы России
  const regions = [
    'Московская область',
    'Ленинградская область',
    'Краснодарский край',
    'Красноярский край',
    'Приморский край',
    'Свердловская область',
    'Ростовская область',
    'Республика Татарстан',
    'Самарская область',
    'Волгоградская область',
    'Нижегородская область',
    'Челябинская область',
    'Иркутская область',
    'Хабаровский край',
    'Ханты-Мансийский АО',
    'Алтайский край',
    'Кемеровская область',
    'Архангельская область',
    'Астраханская область',
    'Белгородская область',
    'Брянская область',
    'Владимирская область',
    'Вологодская область',
    'Воронежская область',
    'Калининградская область',
    'Калужская область',
    'Костромская область',
    'Курская область',
    'Липецкая область',
    'Магаданская область',
    'Мурманская область',
    'Новгородская область',
    'Орловская область',
    'Пензенская область',
    'Псковская область',
    'Рязанская область',
    'Саратовская область',
    'Смоленская область',
    'Тамбовская область',
    'Тверская область',
    'Тульская область',
    'Тюменская область',
    'Ульяновская область',
    'Челябинская область',
    'Ярославская область'
  ];

  const handleScopeChange = (newScope: 'country' | 'region' | 'city') => {
    setScope(newScope);
    
    if (newScope === 'country') {
      setSelectedRegion(null);
      setSelectedCity(null);
      setRegionInput('');
      setCityInput('');
    } else if (newScope === 'region') {
      setSelectedCity(null);
      setCityInput('');
    }
    
    updateLocation(selectedCountry, selectedRegion, selectedCity, newScope);
  };

  const updateLocation = (country: string | null, region: string | null, city: string | null, currentScope: 'country' | 'region' | 'city') => {
    let finalCountry = country || 'Россия';
    let finalRegion = null;
    let finalCity = null;

    if (currentScope === 'region' && region) {
      finalRegion = region;
    } else if (currentScope === 'city' && city) {
      finalCity = city;
      // Автоматически определяем регион для города
      const cityRegion = getRegionByCity(city);
      finalRegion = cityRegion;
    }

    onLocationChange({
      country: finalCountry,
      region: finalRegion,
      city: finalCity
    });
  };

  const getRegionByCity = (city: string): string | null => {
    // Простое сопоставление городов с регионами
    const cityRegionMap: { [key: string]: string } = {
      'Москва': 'Московская область',
      'Санкт-Петербург': 'Ленинградская область',
      'Краснодар': 'Краснодарский край',
      'Воронеж': 'Воронежская область',
      'Новосибирск': 'Новосибирская область',
      'Екатеринбург': 'Свердловская область',
      'Нижний Новгород': 'Нижегородская область',
      'Казань': 'Республика Татарстан',
      'Челябинск': 'Челябинская область',
      'Самара': 'Самарская область',
      'Ростов-на-Дону': 'Ростовская область',
      'Уфа': 'Республика Башкортостан',
      'Омск': 'Омская область',
      'Красноярск': 'Красноярский край',
      'Воронеж': 'Воронежская область',
      'Пермь': 'Пермский край',
      'Волгоград': 'Волгоградская область',
      'Хабаровск': 'Хабаровский край',
      'Саратов': 'Саратовская область',
      'Калининград': 'Калининградская область'
    };
    
    return cityRegionMap[city] || null;
  };

  const handleCountrySelect = () => {
    setSelectedCountry('Россия');
    updateLocation('Россия', null, null, 'country');
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setRegionInput(region);
    updateLocation(selectedCountry, region, null, 'region');
  };

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    setSelectedCity(value);
    updateLocation(selectedCountry, null, value, 'city');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          Выберите геолокацию для задания
        </label>
      </div>

      {/* Кнопки выбора области действия */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => handleScopeChange('country')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            scope === 'country'
              ? 'border-mb-turquoise bg-mb-turquoise/10 text-mb-turquoise'
              : 'border-mb-gray/20 bg-mb-black/50 text-mb-gray hover:border-mb-turquoise/50'
          }`}
        >
          🌍 Вся страна
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('region')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            scope === 'region'
              ? 'border-mb-turquoise bg-mb-turquoise/10 text-mb-turquoise'
              : 'border-mb-gray/20 bg-mb-black/50 text-mb-gray hover:border-mb-turquoise/50'
          }`}
        >
          🗺️ Регион/Край
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('city')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            scope === 'city'
              ? 'border-mb-turquoise bg-mb-turquoise/10 text-mb-turquoise'
              : 'border-mb-gray/20 bg-mb-black/50 text-mb-gray hover:border-mb-turquoise/50'
          }`}
        >
          📍 Город
        </button>
      </div>

      {/* Вся страна */}
      {scope === 'country' && (
        <Card className="p-4 bg-mb-turquoise/5 border-mb-turquoise/20">
          <p className="text-sm text-mb-gray">
            Задание будет доступно для всех исполнителей в России
          </p>
          <input type="hidden" value="Россия" />
        </Card>
      )}

      {/* Выбор региона */}
      {scope === 'region' && (
        <div>
          <Input
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            onFocus={(e) => e.target.style.display = 'none'}
            placeholder="Начните вводить регион или край..."
            list="regions-list"
            className="w-full"
          />
          <datalist id="regions-list">
            {regions.map((region) => (
              <option key={region} value={region} />
            ))}
          </datalist>
          
          {regionInput && (
            <div className="mt-2 p-2 bg-mb-black/50 rounded">
              <p className="text-xs text-mb-gray">
                Задание будет доступно для исполнителей в: <strong className="text-mb-turquoise">{regionInput}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Выбор города */}
      {scope === 'city' && (
        <div>
          <Input
            value={cityInput}
            onChange={(e) => handleCityInputChange(e.target.value)}
            placeholder="Введите город (например, Москва, Воронеж, Краснодар)"
            className="w-full"
          />
          
          {cityInput && (
            <div className="mt-2 p-2 bg-mb-black/50 rounded">
              <p className="text-xs text-mb-gray">
                Задание будет доступно для исполнителей в: <strong className="text-mb-turquoise">{cityInput}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

