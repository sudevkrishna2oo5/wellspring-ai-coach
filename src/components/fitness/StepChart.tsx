
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "@/components/ThemeProvider";

interface StepChartProps {
  className?: string;
}

export function StepChart({ className }: StepChartProps) {
  const { theme } = useTheme();
  
  // Generate past 7 days of step data for demo purposes
  const data = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (dayOfWeek - 6 + i) % 7;
      const dayName = days[dayIndex < 0 ? dayIndex + 7 : dayIndex];
      const isToday = i === 6;
      
      // Generate random steps between 3000 and 12000
      const steps = isToday 
        ? Math.floor(Math.random() * 5000) + 3000  // For "today", lower range for demo
        : Math.floor(Math.random() * 9000) + 3000;
      
      return {
        day: dayName,
        steps,
        calories: Math.round(steps * 0.05),
        isToday,
      };
    });
  }, []);

  // Get colors based on theme
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const chartColors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    text: isDark ? '#e0e0e0' : '#333333',
    grid: isDark ? '#333333' : '#e0e0e0',
    bars: {
      regular: isDark ? '#6366F1' : '#818CF8',
      today: isDark ? '#8B5CF6' : '#A78BFA',
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="gradient-secondary py-4">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Weekly Step History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fill: chartColors.text, fontSize: 12 }} 
              axisLine={{ stroke: chartColors.grid }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: chartColors.text, fontSize: 12 }}
              axisLine={{ stroke: chartColors.grid }}
              tickLine={false}
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
              width={30}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: chartColors.background, 
                border: `1px solid ${chartColors.grid}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: chartColors.text, fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: chartColors.text }}
              formatter={(value, name) => {
                if (name === 'steps') return [`${value.toLocaleString()} steps`, 'Steps'];
                return [`${value} kcal`, 'Calories'];
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="steps" 
              name="Steps"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? chartColors.bars.today : chartColors.bars.regular}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-center text-muted-foreground flex items-center justify-center gap-1">
          <Calendar className="h-4 w-4" /> Last 7 days
        </div>
      </CardContent>
    </Card>
  );
}
