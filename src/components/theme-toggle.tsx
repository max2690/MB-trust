"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Предотвращаем hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { value: "light", icon: Sun, label: "Светлая" },
    { value: "dark", icon: Moon, label: "Темная" },
    { value: "system", icon: Monitor, label: "Системная" },
  ] as const;

  if (!mounted) {
    // Показываем заглушку во время SSR
    return (
      <div className="relative">
        <button
          className="
            group relative
            bg-background/80 backdrop-blur-sm
            border border-border/50
            rounded-xl p-3
            hover:bg-accent/50
            transition-all duration-300 ease-out
            hover:scale-105 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          "
          disabled
        >
          <Monitor className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      {/* Main toggle button */}
      <button
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          const newTheme = themes[nextIndex].value;
          
          console.log('🔄 Переключение темы:', { from: theme, to: newTheme });
          setTheme(newTheme);
          
          // Принудительно обновляем DOM
          setTimeout(() => {
            const root = document.documentElement;
            console.log('🎨 Классы HTML:', root.className);
            console.log('🎨 Data-theme:', root.getAttribute('data-theme'));
          }, 100);
        }}
        className="
          group relative
          bg-background/80 backdrop-blur-sm
          border border-border/50
          rounded-xl p-3
          hover:bg-accent/50
          transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        "
        aria-label="Переключить тему"
      >
        <CurrentIcon className="h-5 w-5 text-foreground transition-all duration-300 group-hover:rotate-12" />
        
        {/* Tooltip */}
        <div className="
          absolute -top-12 left-1/2 transform -translate-x-1/2
          bg-popover text-popover-foreground
          px-3 py-2 rounded-lg text-sm font-medium
          shadow-lg border border-border/50
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          whitespace-nowrap
        ">
          {currentTheme.label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
        </div>
      </button>

      {/* Theme indicator */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-background shadow-sm"></div>
    </div>
  );
}

export function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { value: "light", icon: Sun, label: "Светлая", description: "Классическая светлая тема" },
    { value: "dark", icon: Moon, label: "Темная", description: "Современная темная тема" },
    { value: "system", icon: Monitor, label: "Системная", description: "Следует настройкам системы" },
  ] as const;

  if (!mounted) {
    return (
      <div className="relative group">
        <button className="
          flex items-center gap-3
          bg-background/80 backdrop-blur-sm
          border border-border/50
          rounded-xl px-4 py-3
          hover:bg-accent/50
          transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        " disabled>
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Системная
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="
        flex items-center gap-3
        bg-background/80 backdrop-blur-sm
        border border-border/50
        rounded-xl px-4 py-3
        hover:bg-accent/50
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
      ">
        {(() => {
          const currentTheme = themes.find((t) => t.value === theme);
          const Icon = currentTheme?.icon;
          return Icon ? <Icon className="h-5 w-5 text-foreground" /> : null;
        })()}
        <span className="text-sm font-medium text-foreground">
          {themes.find((t) => t.value === theme)?.label}
        </span>
      </button>

      {/* Dropdown menu */}
      <div className="
        absolute top-full left-0 mt-2
        bg-popover border border-border/50
        rounded-xl shadow-xl
        opacity-0 group-hover:opacity-100
        transition-all duration-200
        pointer-events-none group-hover:pointer-events-auto
        min-w-[200px]
        z-50
      ">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.value;
          
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`
                w-full flex items-center gap-3 px-4 py-3
                text-left transition-all duration-200
                hover:bg-accent/50
                first:rounded-t-xl last:rounded-b-xl
                ${isActive ? 'bg-accent/30' : ''}
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {themeOption.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {themeOption.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}