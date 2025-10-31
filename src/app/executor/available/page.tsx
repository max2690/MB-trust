"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderCard } from "@/components/business/OrderCard";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Filter } from "lucide-react";
import { ExecutorNav } from "@/components/layout/ExecutorNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { OrderUI } from "@/lib/ui-types";

export default function AvailablePage() {
  const [orders, setOrders] = useState<OrderUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNetwork, setFilterNetwork] = useState<string>("all");
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders?role=executor", { cache: "no-store" });
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
        setNotification({ message: 'Ошибка загрузки доступных заданий', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      const r = await fetch("/api/executions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          executorId: 'test-executor-1' // TODO: брать из сессии
        }),
      });
      
      const data = await r.json();
      
      if (data.success) {
        setNotification({ message: 'Заказ принят!', type: 'success' });
        setTimeout(() => {
          router.push("/executor/active");
        }, 1000);
      } else {
        setNotification({ message: 'Ошибка: ' + (data.error || 'Неизвестная ошибка'), type: 'error' });
      }
    } catch (error) {
      console.error("Ошибка принятия заказа:", error);
      setNotification({ message: 'Произошла ошибка при принятии заказа', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mb-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      <ExecutorNav />
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500/20 border-green-500 text-green-300' 
            : 'bg-red-500/20 border-red-500 text-red-300'
        }`}>
          {notification.message}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Доступные задания</h1>
          {orders.length > 0 && (
            <Badge variant="secondary">
              Всего: {orders.length}
            </Badge>
          )}
        </div>

        {/* Фильтр по социальным сетям */}
        {orders.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-mb-gray" />
            <span className="text-sm text-mb-gray">Фильтр:</span>
            <Button
              variant={filterNetwork === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterNetwork("all")}
            >
              Все
            </Button>
            {Array.from(new Set(orders.map((o) => o.socialNetwork))).map((network) => (
              <Button
                key={network}
                variant={filterNetwork === network ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterNetwork(network || "all")}
              >
                {network}
              </Button>
            ))}
          </div>
        )}
        
        {orders.length === 0 ? (
          <Card className="border-0 shadow-lg text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 text-mb-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет доступных заданий</h3>
              <p className="text-mb-gray">
                В данный момент нет доступных заданий. Задания появятся здесь, когда заказчики их создадут.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(filterNetwork === "all" 
              ? orders 
              : orders.filter((o) => o.socialNetwork === filterNetwork)
            ).map((o) => (
              <OrderCard key={o.id} order={o} onAccept={handleAccept} />
            ))}
            {filterNetwork !== "all" && 
             orders.filter((o) => o.socialNetwork === filterNetwork).length === 0 && (
              <Card className="border-0 shadow-lg text-center py-8">
                <CardContent>
                  <p className="text-mb-gray">Нет заданий для выбранной социальной сети</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

