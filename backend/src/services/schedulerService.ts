import { QueueConfig, BusinessHours, QueuePriority } from '../models/Queue';

export class SchedulerService {
  isCallingAllowed(config: QueueConfig): boolean {
    const now = new Date();
    const timezone = config.timezone;
    
    // Check if it's an active day
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' });
    if (!config.activeDays.includes(dayOfWeek)) {
      return false;
    }
    
    // Check business hours
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: timezone 
    });
    
    const businessHours = config.businessHours;
    if (currentTime < businessHours.start || currentTime > businessHours.end) {
      return false;
    }
    
    return true;
  }

  calculateOptimalCallTime(
    priority: QueuePriority,
    businessHours: BusinessHours,
    timezone: string
  ): Date {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: timezone 
    });
    
    // For urgent calls, schedule immediately if in business hours
    if (priority === QueuePriority.URGENT && this.isInBusinessHours(currentTime, businessHours)) {
      return now;
    }
    
    // For other priorities, find next optimal time
    return this.findNextOptimalTime(priority, businessHours, timezone);
  }

  private isInBusinessHours(currentTime: string, businessHours: BusinessHours): boolean {
    return currentTime >= businessHours.start && currentTime <= businessHours.end;
  }

  private findNextOptimalTime(
    priority: QueuePriority,
    businessHours: BusinessHours,
    timezone: string
  ): Date {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find next priority hour
    const priorityHours = businessHours.priorityHours;
    let nextHour = priorityHours.find(hour => hour > currentHour);
    
    if (!nextHour) {
      // If no priority hour today, schedule for tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(priorityHours[0], 0, 0, 0);
      return tomorrow;
    }
    
    // Schedule for next priority hour today
    const nextTime = new Date(now);
    nextTime.setHours(nextHour, 0, 0, 0);
    return nextTime;
  }

  calculateRetryDelay(retryCount: number, config: QueueConfig): number {
    const delays = config.retryDelays;
    return delays[Math.min(retryCount, delays.length - 1)] || delays[delays.length - 1];
  }

  getNextBusinessDay(date: Date, activeDays: string[]): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!activeDays.includes(nextDay.toLocaleDateString('en-US', { weekday: 'short' }))) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  }

  isHoliday(date: Date, holidays: Date[]): boolean {
    const dateString = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.toISOString().split('T')[0] === dateString);
  }

  getBusinessHoursForDate(date: Date, businessHours: BusinessHours): { start: Date; end: Date } {
    const startTime = new Date(date);
    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    return { start: startTime, end: endTime };
  }
}