
import { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const icons = {
    light: <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />,
    dark: <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />,
    system: <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />,
  };

  const themeLabels = {
    light: "Light",
    dark: "Dark",
    system: "System"
  };

  const currentIcon = icons[theme] || icons.system;
  const currentLabel = themeLabels[theme] || themeLabels.system;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "group h-9 px-2 py-2 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 transition-all duration-200",
            className
          )}
          onClick={() => setOpen(true)}
        >
          {currentIcon}
          <span className="sr-only md:not-sr-only md:ml-2 text-sm font-normal">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-popover border-border">
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setTheme("system")}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
