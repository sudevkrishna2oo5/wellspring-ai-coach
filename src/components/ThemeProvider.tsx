
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type Theme = "dark" | "light" | "system";
type ThemePalette = string; // just palette value from the palette array above

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  palette: ThemePalette | null;
  setPalette: (palette: ThemePalette) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  palette: null,
  setPalette: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Must match src/components/ThemePaletteSelector.tsx palette list:
const palettes: Record<string, any> = {
  "pink-teal-cream": {
    "--background": "36 100% 96%",
    "--foreground": "240 23% 16%",
    "--primary": "330 100% 78%",
    "--secondary": "180 65% 60%",
    "--card": "36 100% 98%",
    "--accent": "333 97% 65%",
  },
  "orange-yellow": {
    "--background": "45 100% 96%",
    "--foreground": "24 55% 27%",
    "--primary": "36 96% 55%",
    "--secondary": "54 100% 62%",
    "--card": "36 100% 98%",
    "--accent": "45 97% 65%",
  },
  "fuchsia-darkgrey": {
    "--background": "240 9% 18%",
    "--foreground": "0 0% 100%",
    "--primary": "300 84% 52%",
    "--secondary": "240 6% 32%",
    "--card": "240 12% 22%",
    "--accent": "300 87% 70%",
  },
  "green-red-white": {
    "--background": "0 0% 100%",
    "--foreground": "145 80% 26%",
    "--primary": "145 70% 45%",
    "--secondary": "350 84% 57%",
    "--card": "0 0% 99%",
    "--accent": "350 87% 64%",
  },
  "cream-black": {
    "--background": "36 100% 96%",
    "--foreground": "0 0% 7%",
    "--primary": "36 100% 96%",
    "--secondary": "0 0% 7%",
    "--card": "36 100% 99%",
    "--accent": "0 0% 7%",
  },
  "black-white": {
    "--background": "0 0% 7%",
    "--foreground": "0 0% 100%",
    "--primary": "0 0% 100%",
    "--secondary": "0 0% 100%",
    "--card": "0 0% 13%",
    "--accent": "0 0% 100%",
  },
  "darkpink-white": {
    "--background": "330 38% 20%",
    "--foreground": "0 0% 100%",
    "--primary": "339 84% 55%",
    "--secondary": "0 0% 100%",
    "--card": "338 31% 27%",
    "--accent": "340 59% 70%",
  },
  "blue-mint": {
    "--background": "168 71% 94%",
    "--foreground": "226 46% 22%",
    "--primary": "221 76% 61%",
    "--secondary": "168 66% 79%",
    "--card": "168 71% 96%",
    "--accent": "168 63% 52%",
  },
  "red-black": {
    "--background": "0 0% 7%",
    "--foreground": "350 84% 57%",
    "--primary": "350 84% 57%",
    "--secondary": "0 0% 100%",
    "--card": "0 0% 15%",
    "--accent": "0 0% 100%",
  },
  "darkgreen-ivory-yellow": {
    "--background": "142 45% 21%",
    "--foreground": "60 30% 96%",
    "--primary": "64 100% 52%",
    "--secondary": "46 85% 91%",
    "--card": "64 100% 96%",
    "--accent": "53 100% 69%",
  },
  "brightgreen-hotpink": {
    "--background": "130 83% 92%",
    "--foreground": "326 84% 52%",
    "--primary": "130 71% 63%",
    "--secondary": "326 84% 52%",
    "--card": "130 83% 96%",
    "--accent": "342 76% 65%",
  },
  "darkgrey-yellowgreen": {
    "--background": "222 8% 17%",
    "--foreground": "90 54% 60%",
    "--primary": "90 54% 60%",
    "--secondary": "52 100% 63%",
    "--card": "222 8% 22%",
    "--accent": "66 86% 63%",
  },
  "blueshades-white": {
    "--background": "215 60% 99%",
    "--foreground": "221 76% 51%",
    "--primary": "221 76% 61%",
    "--secondary": "217 88% 67%",
    "--card": "229 46% 97%",
    "--accent": "218 100% 81%",
  },
  "white-limegreen": {
    "--background": "0 0% 100%",
    "--foreground": "89 80% 32%",
    "--primary": "89 80% 32%",
    "--secondary": "89 100% 58%",
    "--card": "0 0% 97%",
    "--accent": "89 80% 40%",
  },
  "beige-darkgrey": {
    "--background": "42 56% 89%",
    "--foreground": "240 14% 23%",
    "--primary": "42 56% 82%",
    "--secondary": "240 10% 27%",
    "--card": "42 56% 92%",
    "--accent": "240 11% 28%",
  },
  "pastel-purple-neutral": {
    "--background": "255 56% 95%",
    "--foreground": "254 21% 46%",
    "--primary": "260 56% 81%",
    "--secondary": "30 20% 88%",
    "--card": "255 56% 99%",
    "--accent": "260 56% 62%",
  },
  "navy-electricblue": {
    "--background": "226 45% 18%",
    "--foreground": "199 98% 48%",
    "--primary": "226 79% 39%",
    "--secondary": "201 100% 59%",
    "--card": "226 45% 21%",
    "--accent": "235 100% 68%",
  },
  "gradient-white-darkblue": {
    "--background": "224 36% 13%",
    "--foreground": "0 0% 100%",
    "--primary": "244 100% 65%",
    "--secondary": "0 0% 100%",
    "--card": "225 36% 18%",
    "--accent": "220 60% 46%",
  },
  "white-bluegrey": {
    "--background": "0 0% 100%",
    "--foreground": "210 26% 45%",
    "--primary": "210 26% 75%",
    "--secondary": "207 28% 76%",
    "--card": "210 26% 97%",
    "--accent": "205 23% 67%",
  },
  "brightred-white": {
    "--background": "0 0% 100%",
    "--foreground": "0 74% 56%",
    "--primary": "0 74% 56%",
    "--secondary": "0 0% 100%",
    "--card": "0 13% 96%",
    "--accent": "0 74% 56%",
  },
  "classicblue-turquoise-gold": {
    "--background": "210 87% 85%",
    "--foreground": "205 100% 44%",
    "--primary": "225 70% 54%",
    "--secondary": "174 72% 56%",
    "--card": "210 87% 94%",
    "--accent": "46 100% 51%",
  },
  "yellow-blue": {
    "--background": "53 100% 95%",
    "--foreground": "209 72% 39%",
    "--primary": "48 100% 60%",
    "--secondary": "209 72% 39%",
    "--card": "53 100% 98%",
    "--accent": "209 96% 47%",
  },
  "darkroyal-gold": {
    "--background": "233 52% 19%",
    "--foreground": "46 100% 51%",
    "--primary": "233 52% 29%",
    "--secondary": "46 100% 51%",
    "--card": "233 52% 23%",
    "--accent": "46 100% 61%",
  },
  "white-purple": {
    "--background": "0 0% 100%",
    "--foreground": "265 84% 36%",
    "--primary": "265 84% 36%",
    "--secondary": "265 92% 77%",
    "--card": "0 0% 97%",
    "--accent": "265 84% 46%",
  },
  "blues-redviolet": {
    "--background": "221 43% 97%",
    "--foreground": "340 82% 52%",
    "--primary": "221 76% 61%",
    "--secondary": "340 82% 52%",
    "--card": "221 42% 91%",
    "--accent": "284 82% 56%",
  },
  "yellow-brown": {
    "--background": "43 100% 90%",
    "--foreground": "16 74% 24%",
    "--primary": "43 100% 70%",
    "--secondary": "16 32% 44%",
    "--card": "43 100% 98%",
    "--accent": "16 74% 34%",
  },
};

const LOCAL_PALETTE_KEY = "fitvibe-ui-theme-palette";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "fitvibe-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeInternal] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [palette, setPaletteInternal] = useState<ThemePalette | null>(
    () => localStorage.getItem(LOCAL_PALETTE_KEY) || "pink-teal-cream"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Apply palette variables
    if (palette && palettes[palette]) {
      const root = window.document.documentElement;
      Object.entries(palettes[palette]).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      localStorage.setItem(LOCAL_PALETTE_KEY, palette);
    }
  }, [palette]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setThemeInternal(theme);
      toast.success(`${theme.charAt(0).toUpperCase() + theme.slice(1)} mode activated`);
    },
    palette,
    setPalette: (p: ThemePalette) => {
      setPaletteInternal(p);
      toast.success(`Theme "${palettes[p]?.label || p}" applied`);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

