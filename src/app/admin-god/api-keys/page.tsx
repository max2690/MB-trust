'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  description?: string;
  permissions: string[];
  lastUsed?: Date;
  requestCount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newKey, setNewKey] = useState({
    name: '',
    description: '',
    permissions: ['orders:read', 'executions:write']
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      setApiKeys(data.data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ API ключ создан!\n\n${data.data.key}\n\n⚠️ Сохраните его! Больше он не будет показан.`);
        setShowCreateModal(false);
        setNewKey({ name: '', description: '', permissions: ['orders:read', 'executions:write'] });
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Ошибка создания ключа');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Вы уверены? Ключ будет удален безвозвратно!')) return;
    
    try {
      const response = await fetch(`/api/admin/api-keys?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Ключи</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Создать ключ
        </button>
      </div>

      {/* Таблица ключей */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Название</th>
              <th className="px-4 py-3 text-left">Ключ (первые 20 символов)</th>
              <th className="px-4 py-3 text-left">Права</th>
              <th className="px-4 py-3 text-left">Запросов</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-t border-gray-700">
                <td className="px-4 py-3">{key.name}</td>
                <td className="px-4 py-3 font-mono text-sm">
                  {key.key.substring(0, 20)}...
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(key.permissions as string[]).map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{key.requestCount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    key.isActive ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {key.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Создать API ключ</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Название</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  placeholder="Mobile App"
                />
              </div>
              
              <div>
                <label className="block mb-1">Описание</label>
                <textarea
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  placeholder="Опционально"
                />
              </div>
              
              <div>
                <label className="block mb-1">Права доступа</label>
                <input
                  type="text"
                  value={newKey.permissions.join(', ')}
                  onChange={(e) => setNewKey({ ...newKey, permissions: e.target.value.split(', ').filter(Boolean) })}
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  placeholder="orders:read, executions:write"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateKey}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

