
export type SleepQualityLevel = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepAnalytics {
  totalSleepHours: number;
  averageQuality: number;
  qualityLevel: SleepQualityLevel;
  consistency: number;
  consistencyTrend: 'improving' | 'declining' | 'stable';
  optimalHours: number;
}

export function calculateSleepQualityLevel(rating: number): SleepQualityLevel {
  if (rating <= 3) return 'poor';
  if (rating <= 5) return 'fair';
  if (rating <= 8) return 'good';
  return 'excellent';
}

export function calculateSleepConsistency(sleepRecords: any[]): number {
  if (sleepRecords.length < 3) return 0;
  
  // Calculate variance in sleep hours
  const hours = sleepRecords.map(record => record.hours);
  const avg = hours.reduce((sum, val) => sum + val, 0) / hours.length;
  const variance = hours.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / hours.length;
  
  // Lower variance means higher consistency (0-100 scale)
  const consistency = Math.max(0, 100 - (variance * 20));
  return Math.min(100, consistency);
}

export function analyzeConsistencyTrend(sleepRecords: any[]): 'improving' | 'declining' | 'stable' {
  if (sleepRecords.length < 5) return 'stable';
  
  // Compare recent variance to older variance
  const recentRecords = sleepRecords.slice(0, Math.floor(sleepRecords.length / 2));
  const olderRecords = sleepRecords.slice(Math.floor(sleepRecords.length / 2));
  
  const recentConsistency = calculateSleepConsistency(recentRecords);
  const olderConsistency = calculateSleepConsistency(olderRecords);
  
  if (recentConsistency > olderConsistency + 5) return 'improving';
  if (recentConsistency < olderConsistency - 5) return 'declining';
  return 'stable';
}

export function calculateOptimalSleepHours(sleepRecords: any[]): number {
  if (sleepRecords.length < 5) return 8; // Default recommendation
  
  // Find the hours associated with the highest quality ratings
  const weightedHours = sleepRecords.map(record => ({
    hours: record.hours,
    weight: record.quality_rating
  }));
  
  const totalWeight = weightedHours.reduce((sum, item) => sum + item.weight, 0);
  const weightedAverage = weightedHours.reduce(
    (sum, item) => sum + (item.hours * item.weight), 
    0
  ) / totalWeight;
  
  return Math.round(weightedAverage * 10) / 10; // Round to 1 decimal place
}

export function getSleepAnalytics(sleepRecords: any[]): SleepAnalytics {
  const sortedRecords = [...sleepRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate total sleep (average of last 7 days or less)
  const recentRecords = sortedRecords.slice(0, Math.min(7, sortedRecords.length));
  const totalSleepHours = recentRecords.reduce((sum, record) => sum + record.hours, 0) / recentRecords.length;
  
  // Average quality rating
  const averageQuality = recentRecords.reduce(
    (sum, record) => sum + (record.quality_rating || 0), 
    0
  ) / recentRecords.length;
  
  // Get consistency score
  const consistency = calculateSleepConsistency(recentRecords);
  
  // Analyze trend
  const consistencyTrend = analyzeConsistencyTrend(sortedRecords);
  
  // Calculate optimal hours
  const optimalHours = calculateOptimalSleepHours(sortedRecords.filter(r => r.quality_rating > 7));
  
  return {
    totalSleepHours: Math.round(totalSleepHours * 10) / 10,
    averageQuality: Math.round(averageQuality * 10) / 10,
    qualityLevel: calculateSleepQualityLevel(averageQuality),
    consistency: Math.round(consistency),
    consistencyTrend,
    optimalHours
  };
}
