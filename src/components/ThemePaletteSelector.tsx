
import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const palettes = [
  {
    label: "Pink, teal, and cream",
    value: "pink-teal-cream",
    colors: {
      "--background": "36 100% 96%",
      "--foreground": "240 23% 16%",
      "--primary": "330 100% 78%",
      "--secondary": "180 65% 60%",
      "--card": "36 100% 98%",
      "--accent": "333 97% 65%",
    },
  },
  {
    label: "Orange and yellow",
    value: "orange-yellow",
    colors: {
      "--background": "45 100% 96%",
      "--foreground": "24 55% 27%",
      "--primary": "36 96% 55%",
      "--secondary": "54 100% 62%",
      "--card": "36 100% 98%",
      "--accent": "45 97% 65%",
    },
  },
  {
    label: "Fuchsia and dark grey",
    value: "fuchsia-darkgrey",
    colors: {
      "--background": "240 9% 18%",
      "--foreground": "0 0% 100%",
      "--primary": "300 84% 52%",
      "--secondary": "240 6% 32%",
      "--card": "240 12% 22%",
      "--accent": "300 87% 70%",
    }
  },
  {
    label: "Green, red, and white",
    value: "green-red-white",
    colors: {
      "--background": "0 0% 100%",
      "--foreground": "145 80% 26%",
      "--primary": "145 70% 45%",
      "--secondary": "350 84% 57%",
      "--card": "0 0% 99%",
      "--accent": "350 87% 64%",
    }
  },
  {
    label: "Cream and black",
    value: "cream-black",
    colors: {
      "--background": "36 100% 96%",
      "--foreground": "0 0% 7%",
      "--primary": "36 100% 96%",
      "--secondary": "0 0% 7%",
      "--card": "36 100% 99%",
      "--accent": "0 0% 7%",
    }
  },
  {
    label: "Black and white",
    value: "black-white",
    colors: {
      "--background": "0 0% 7%",
      "--foreground": "0 0% 100%",
      "--primary": "0 0% 100%",
      "--secondary": "0 0% 100%",
      "--card": "0 0% 13%",
      "--accent": "0 0% 100%",
    }
  },
  {
    label: "Dark pink and white",
    value: "darkpink-white",
    colors: {
      "--background": "330 38% 20%",
      "--foreground": "0 0% 100%",
      "--primary": "339 84% 55%",
      "--secondary": "0 0% 100%",
      "--card": "338 31% 27%",
      "--accent": "340 59% 70%",
    }
  },
  {
    label: "Blue and mint",
    value: "blue-mint",
    colors: {
      "--background": "168 71% 94%",
      "--foreground": "226 46% 22%",
      "--primary": "221 76% 61%",
      "--secondary": "168 66% 79%",
      "--card": "168 71% 96%",
      "--accent": "168 63% 52%",
    }
  },
  {
    label: "Red and black",
    value: "red-black",
    colors: {
      "--background": "0 0% 7%",
      "--foreground": "350 84% 57%",
      "--primary": "350 84% 57%",
      "--secondary": "0 0% 100%",
      "--card": "0 0% 15%",
      "--accent": "0 0% 100%",
    }
  },
  {
    label: "Dark green, ivory, and yellow",
    value: "darkgreen-ivory-yellow",
    colors: {
      "--background": "142 45% 21%",
      "--foreground": "60 30% 96%",
      "--primary": "64 100% 52%",
      "--secondary": "46 85% 91%",
      "--card": "64 100% 96%",
      "--accent": "53 100% 69%",
    }
  },
  {
    label: "Bright green and hot pink",
    value: "brightgreen-hotpink",
    colors: {
      "--background": "130 83% 92%",
      "--foreground": "326 84% 52%",
      "--primary": "130 71% 63%",
      "--secondary": "326 84% 52%",
      "--card": "130 83% 96%",
      "--accent": "342 76% 65%",
    }
  },
  {
    label: "Dark grey and yellow-green",
    value: "darkgrey-yellowgreen",
    colors: {
      "--background": "222 8% 17%",
      "--foreground": "90 54% 60%",
      "--primary": "90 54% 60%",
      "--secondary": "52 100% 63%",
      "--card": "222 8% 22%",
      "--accent": "66 86% 63%",
    }
  },
  {
    label: "Blue shades and white",
    value: "blueshades-white",
    colors: {
      "--background": "215 60% 99%",
      "--foreground": "221 76% 51%",
      "--primary": "221 76% 61%",
      "--secondary": "217 88% 67%",
      "--card": "229 46% 97%",
      "--accent": "218 100% 81%",
    }
  },
  {
    label: "White and lime green",
    value: "white-limegreen",
    colors: {
      "--background": "0 0% 100%",
      "--foreground": "89 80% 32%",
      "--primary": "89 80% 32%",
      "--secondary": "89 100% 58%",
      "--card": "0 0% 97%",
      "--accent": "89 80% 40%",
    }
  },
  {
    label: "Beige and dark grey",
    value: "beige-darkgrey",
    colors: {
      "--background": "42 56% 89%",
      "--foreground": "240 14% 23%",
      "--primary": "42 56% 82%",
      "--secondary": "240 10% 27%",
      "--card": "42 56% 92%",
      "--accent": "240 11% 28%",
    }
  },
  {
    label: "Pastel purple and neutral accents",
    value: "pastel-purple-neutral",
    colors: {
      "--background": "255 56% 95%",
      "--foreground": "254 21% 46%",
      "--primary": "260 56% 81%",
      "--secondary": "30 20% 88%",
      "--card": "255 56% 99%",
      "--accent": "260 56% 62%",
    }
  },
  {
    label: "Navy blue and electric blue",
    value: "navy-electricblue",
    colors: {
      "--background": "226 45% 18%",
      "--foreground": "199 98% 48%",
      "--primary": "226 79% 39%",
      "--secondary": "201 100% 59%",
      "--card": "226 45% 21%",
      "--accent": "235 100% 68%",
    }
  },
  {
    label: "Color gradient, white, and dark blue",
    value: "gradient-white-darkblue",
    colors: {
      "--background": "224 36% 13%",
      "--foreground": "0 0% 100%",
      "--primary": "244 100% 65%",
      "--secondary": "0 0% 100%",
      "--card": "225 36% 18%",
      "--accent": "220 60% 46%",
    }
  },
  {
    label: "White and blue-grey",
    value: "white-bluegrey",
    colors: {
      "--background": "0 0% 100%",
      "--foreground": "210 26% 45%",
      "--primary": "210 26% 75%",
      "--secondary": "207 28% 76%",
      "--card": "210 26% 97%",
      "--accent": "205 23% 67%",
    }
  },
  {
    label: "Bright red and white",
    value: "brightred-white",
    colors: {
      "--background": "0 0% 100%",
      "--foreground": "0 74% 56%",
      "--primary": "0 74% 56%",
      "--secondary": "0 0% 100%",
      "--card": "0 13% 96%",
      "--accent": "0 74% 56%",
    }
  },
  {
    label: "Classic blue, turquoise, and gold",
    value: "classicblue-turquoise-gold",
    colors: {
      "--background": "210 87% 85%",
      "--foreground": "205 100% 44%",
      "--primary": "225 70% 54%",
      "--secondary": "174 72% 56%",
      "--card": "210 87% 94%",
      "--accent": "46 100% 51%",
    }
  },
  {
    label: "Yellow and blue",
    value: "yellow-blue",
    colors: {
      "--background": "53 100% 95%",
      "--foreground": "209 72% 39%",
      "--primary": "48 100% 60%",
      "--secondary": "209 72% 39%",
      "--card": "53 100% 98%",
      "--accent": "209 96% 47%",
    }
  },
  {
    label: "Dark royal blue and gold",
    value: "darkroyal-gold",
    colors: {
      "--background": "233 52% 19%",
      "--foreground": "46 100% 51%",
      "--primary": "233 52% 29%",
      "--secondary": "46 100% 51%",
      "--card": "233 52% 23%",
      "--accent": "46 100% 61%",
    }
  },
  {
    label: "White and purple",
    value: "white-purple",
    colors: {
      "--background": "0 0% 100%",
      "--foreground": "265 84% 36%",
      "--primary": "265 84% 36%",
      "--secondary": "265 92% 77%",
      "--card": "0 0% 97%",
      "--accent": "265 84% 46%",
    }
  },
  {
    label: "Blue shades, white, and red-violet",
    value: "blues-redviolet",
    colors: {
      "--background": "221 43% 97%",
      "--foreground": "340 82% 52%",
      "--primary": "221 76% 61%",
      "--secondary": "340 82% 52%",
      "--card": "221 42% 91%",
      "--accent": "284 82% 56%",
    }
  },
  {
    label: "Yellow and brown",
    value: "yellow-brown",
    colors: {
      "--background": "43 100% 90%",
      "--foreground": "16 74% 24%",
      "--primary": "43 100% 70%",
      "--secondary": "16 32% 44%",
      "--card": "43 100% 98%",
      "--accent": "16 74% 34%",
    }
  }
];

export function ThemePaletteSelector({className=""}:{className?:string}) {
  const { theme, setPalette, palette } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1" onClick={() => setOpen(true)}>
          <Palette className="w-4 h-4 mr-2" />
          Theme Palette
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-popover border-border w-64 max-h-96 overflow-y-auto">
        {palettes.map(option => (
          <DropdownMenuItem 
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { setPalette(option.value); setOpen(false); }}
          >
            <span className="flex flex-row gap-1">
              {Object.values(option.colors).slice(0,3).map((color, i) => (
                <span key={i} className="w-4 h-4 rounded-full border" style={{background: `hsl(${color})`}} />
              ))}
            </span>
            <span className="ml-2">{option.label}</span>
            {palette === option.value && <Check className="ml-auto w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
