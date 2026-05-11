import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-muted-foreground"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        aria-pressed={!isDark}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
          !isDark ? 'bg-primary text-primary-foreground' : 'hover:text-foreground'
        }`}
      >
        <Sun size={14} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        aria-pressed={isDark}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
          isDark ? 'bg-primary text-primary-foreground' : 'hover:text-foreground'
        }`}
      >
        <Moon size={14} />
      </button>
    </div>
  );
};

export default ThemeToggle;
