import { useEffect, useCallback } from 'react';
import { 
  trackPageView, 
  trackSectionView,
  pushToDataLayer 
} from '@/react-app/utils/tracking';

// Hook for page tracking
export const usePageTracking = (pageName: string) => {
  useEffect(() => {
    // Track page view on mount
    trackPageView(pageName);
  }, [pageName]);
};

// Hook for scroll tracking
export const useScrollTracking = () => {
  useEffect(() => {
    let scrollPercentages: number[] = [];
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
      
      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 90, 100];
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !scrollPercentages.includes(milestone)) {
          scrollPercentages.push(milestone);
          pushToDataLayer({
            event: 'scroll_milestone',
            scroll_percentage: milestone,
            timestamp: new Date().toISOString(),
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};

// Hook for intersection observer tracking
export const useIntersectionTracking = () => {
  const trackElementView = useCallback((elementId: string, sectionName: string) => {
    const element = document.getElementById(elementId);
    
    if (!element) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackSectionView(sectionName);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, []);
  
  return { trackElementView };
};

// Hook for timer tracking
export const useTimerTracking = (initialTimeLeft: { hours: number; minutes: number; seconds: number }) => {
  useEffect(() => {
    const totalSeconds = initialTimeLeft.hours * 3600 + initialTimeLeft.minutes * 60 + initialTimeLeft.seconds;
    
    // Track timer milestones
    const milestones = [
      { name: 'timer_50_percent', threshold: totalSeconds * 0.5 },
      { name: 'timer_25_percent', threshold: totalSeconds * 0.25 },
      { name: 'timer_10_percent', threshold: totalSeconds * 0.1 },
      { name: 'timer_5_minutes', threshold: 300 },
      { name: 'timer_1_minute', threshold: 60 },
    ];
    
    let trackedMilestones: string[] = [];
    
    const interval = setInterval(() => {
      const currentTime = initialTimeLeft.hours * 3600 + initialTimeLeft.minutes * 60 + initialTimeLeft.seconds;
      
      milestones.forEach(milestone => {
        if (currentTime <= milestone.threshold && !trackedMilestones.includes(milestone.name)) {
          trackedMilestones.push(milestone.name);
          pushToDataLayer({
            event: 'timer_milestone',
            milestone_name: milestone.name,
            time_remaining: currentTime,
            timestamp: new Date().toISOString(),
          });
        }
      });
      
      if (currentTime <= 0 && !trackedMilestones.includes('timer_expired')) {
        trackedMilestones.push('timer_expired');
        pushToDataLayer({
          event: 'timer_expired',
          timestamp: new Date().toISOString(),
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [initialTimeLeft]);
};
