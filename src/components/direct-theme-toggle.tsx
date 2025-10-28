"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function DirectThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("mb-trust-theme") as "light" | "dark" | "system" || "system";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;
    
    // Удаляем все классы тем
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");
    
    let actualTheme = theme;
    
    if (theme === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    // Применяем тему к HTML и body
    root.classList.add(actualTheme);
    body.classList.add(actualTheme);
    root.setAttribute("data-theme", actualTheme);
    
    // Принудительно устанавливаем CSS переменные
    if (actualTheme === "light") {
      root.style.setProperty("--background", "0 0% 100%");
      root.style.setProperty("--foreground", "222.2 84% 4.9%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--primary", "221.2 83.2% 53.3%");
      root.style.setProperty("--primary-foreground", "255 255 255");
      root.style.setProperty("--secondary", "210 40% 98%");
      root.style.setProperty("--secondary-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--muted", "210 40% 96%");
      root.style.setProperty("--muted-foreground", "215.4 16.3% 46.9%");
      root.style.setProperty("--border", "214.3 31.8% 91.4%");
    } else {
      root.style.setProperty("--background", "222.2 84% 4.9%");
      root.style.setProperty("--foreground", "210 40% 98%");
      root.style.setProperty("--card", "222.2 84% 4.9%");
      root.style.setProperty("--card-foreground", "210 40% 98%");
      root.style.setProperty("--primary", "217.2 91.2% 59.8%");
      root.style.setProperty("--primary-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--secondary", "217.2 32.6% 17.5%");
      root.style.setProperty("--secondary-foreground", "210 40% 98%");
      root.style.setProperty("--muted", "217.2 32.6% 17.5%");
      root.style.setProperty("--muted-foreground", "215 20.2% 65.1%");
      root.style.setProperty("--border", "217.2 32.6% 17.5%");
    }
    
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
      <button className="p-3 rounded-xl bg-gray-100 border border-gray-200" disabled>
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





