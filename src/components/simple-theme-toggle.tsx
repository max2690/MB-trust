"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function SimpleThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem("mb-trust-theme") as "light" | "dark" | "system" || "system";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Удаляем все классы тем
    root.classList.remove("light", "dark");
    
    let actualTheme = theme;
    
    if (theme === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    // Применяем тему
    root.classList.add(actualTheme);
    root.setAttribute("data-theme", actualTheme);
    
    // Сохраняем в localStorage
    localStorage.setItem("mb-trust-theme", theme);
    
    console.log(`🎨 Тема установлена: ${actualTheme} (выбрана: ${theme})`);
  }, [theme, mounted]);

  const themes = [
    { value: "light", icon: Sun, label: "Светлая" },
    { value: "dark", icon: Moon, label: "Темная" },
    { value: "system", icon: Monitor, label: "Системная" },
  ] as const;

  if (!mounted) {
    return (
      <button className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" disabled>
        <Monitor className="h-5 w-5 text-gray-500" />
      </button>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <button
      onClick={() => {
        const currentIndex = themes.findIndex((t) => t.value === theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex].value;
        
        console.log(`🔄 Переключение: ${theme} → ${newTheme}`);
        setTheme(newTheme);
      }}
      className="
        p-3 rounded-xl 
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition-all duration-200
        hover:scale-105 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
      title={`Текущая тема: ${currentTheme.label}`}
    >
      <CurrentIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
    </button>
  );
}





