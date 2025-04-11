
import { format, subDays } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Moon, Clock, TrendingUp, TrendingDown, BarChart } from "lucide-react";
import { SleepAnalytics } from '@/utils/sleepAnalytics';

interface SleepSummaryProps {
  analytics: SleepAnalytics;
}

export function SleepSummary({ analytics }: SleepSummaryProps) {
  return (
    <Card className="gradient-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <Moon className="mr-2 h-5 w-5 text-indigo-DEFAULT" />
            <span>Sleep Summary</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {format(subDays(new Date(), 7), 'MMM d')} - {format(new Date(), 'MMM d')}
          </span>
        </CardTitle>
        <CardDescription>Your recent sleep analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Average Sleep</h4>
              <Clock className="h-4 w-4 text-indigo-DEFAULT" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{analytics.totalSleepHours}</span>
              <span className="ml-1 text-muted-foreground">hrs</span>
            </div>
            <div className="mt-1 text-xs">
              <span className={analytics.totalSleepHours >= 7 ? 'text-green-500' : 'text-amber-500'}>
                {analytics.totalSleepHours >= 7 ? 'Good' : 'Below recommended'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Quality Score</h4>
              <Sparkles className="h-4 w-4 text-amber-DEFAULT" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{analytics.averageQuality}</span>
              <span className="ml-1 text-muted-foreground">/10</span>
            </div>
            <div className="mt-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    analytics.qualityLevel === 'poor' ? 'bg-red-400' : 
                    analytics.qualityLevel === 'fair' ? 'bg-amber-400' : 
                    analytics.qualityLevel === 'good' ? 'bg-green-400' : 
                    'bg-indigo-400'
                  }`}
                  style={{ width: `${analytics.averageQuality * 10}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs capitalize">{analytics.qualityLevel}</div>
            </div>
          </div>

          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Consistency</h4>
              {analytics.consistencyTrend === 'improving' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : analytics.consistencyTrend === 'declining' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <BarChart className="h-4 w-4 text-violet-DEFAULT" />
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{analytics.consistency}%</span>
            </div>
            <div className="mt-1">
              <Progress value={analytics.consistency} className="h-1.5" />
              <div className="mt-1 text-xs">
                {analytics.consistencyTrend === 'improving' ? (
                  <span className="text-green-500">Improving</span>
                ) : analytics.consistencyTrend === 'declining' ? (
                  <span className="text-red-500">Declining</span>
                ) : (
                  <span className="text-muted-foreground">Stable</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-background/50 rounded-lg">
          <div className="flex items-center mb-2">
            <Moon className="h-4 w-4 mr-2 text-indigo-DEFAULT" />
            <h4 className="text-sm font-medium">Your optimal sleep duration</h4>
          </div>
          <p className="text-sm">Based on your highest quality sleep sessions, your optimal sleep duration is <span className="font-bold text-indigo-DEFAULT">{analytics.optimalHours} hours</span>.</p>
        </div>
      </CardContent>
    </Card>
  );
}
