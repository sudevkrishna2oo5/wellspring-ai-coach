
import { useState } from 'react';
import { format, subDays, isSameDay } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';

type SleepRecord = Tables<"sleep">;

interface SleepChartProps {
  sleepRecords: SleepRecord[];
}

export function SleepChart({ sleepRecords }: SleepChartProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  const prepareChartData = () => {
    const now = new Date();
    const daysToShow = timeRange === 'week' ? 7 : 30;
    
    // Create array of days
    const days = Array.from({ length: daysToShow }, (_, i) => {
      const date = subDays(now, daysToShow - i - 1);
      return {
        date,
        formattedDate: format(date, 'MMM dd'),
        hours: 0,
        quality: null
      };
    });
    
    // Fill in actual sleep data
    sleepRecords.forEach(record => {
      const recordDate = new Date(record.date);
      const dayIndex = days.findIndex(day => isSameDay(day.date, recordDate));
      
      if (dayIndex !== -1) {
        days[dayIndex].hours = record.hours;
        days[dayIndex].quality = record.quality_rating;
      }
    });
    
    return days;
  };
  
  const chartData = prepareChartData();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sleep Pattern</CardTitle>
          <div className="flex space-x-1">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-2 py-1 rounded text-xs ${
                timeRange === 'week' 
                  ? 'bg-indigo-DEFAULT text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-2 py-1 rounded text-xs ${
                timeRange === 'month' 
                  ? 'bg-indigo-DEFAULT text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 10 }}
                interval={timeRange === 'week' ? 0 : 'preserveStartEnd'} 
              />
              <YAxis 
                domain={[0, 12]} 
                tick={{ fontSize: 10 }} 
                tickCount={7} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '0.5rem', 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
                formatter={(value: any, _name: any, props: any) => {
                  if (props.dataKey === 'hours') {
                    return [value + ' hours', 'Sleep'];
                  }
                  if (props.dataKey === 'quality') {
                    return value !== null ? [value + '/10', 'Quality'] : ['-', 'Quality'];
                  }
                  return [value, _name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine y={8} stroke="#8884d8" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#8B5CF6" 
                fill="url(#sleepGradient)" 
                strokeWidth={2}
                dot={{ stroke: '#8B5CF6', strokeWidth: 1, r: 2, fill: '#8B5CF6' }}
                activeDot={{ r: 3, stroke: '#8B5CF6', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          <span className="inline-block w-4 h-0.5 bg-indigo-400 mr-1 align-middle"></span>
          <span>Sleep Duration</span>
          <span className="inline-block mx-2">•</span>
          <span className="inline-block w-4 h-0.5 bg-purple-400 mr-1 align-middle opacity-50"></span>
          <span>Recommended (8h)</span>
        </div>
      </CardContent>
    </Card>
  );
}
