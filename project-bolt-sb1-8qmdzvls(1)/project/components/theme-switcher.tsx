'use client';

import { useTheme } from '@/lib/theme-context';
import { Sun, Moon, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'oled';

const themeConfig: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Светлая', icon: Sun },
  { id: 'dark', label: 'Тёмная', icon: Moon },
  { id: 'oled', label: 'OLED', icon: Circle },
];

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-muted/50', className)}>
      {themeConfig.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
            theme === t.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title={t.label}
        >
          <t.icon className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
