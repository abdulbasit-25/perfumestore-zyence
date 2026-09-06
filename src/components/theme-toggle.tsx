import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { applyTheme, useTheme } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative h-7 w-14 rounded-full border border-hairline bg-surface-2 transition-colors duration-500",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 grid h-[22px] w-[22px] place-items-center rounded-full bg-foreground text-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark && "translate-x-[28px]",
        )}
      >
        {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      </span>
    </button>
  );
}
