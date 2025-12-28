import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ActivityLog, getChildById, getUserById } from '@/lib/mockData';
import { Clock, Moon, Smile, Frown, Zap, Battery, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityCardProps {
  activity: ActivityLog;
  showChildName?: boolean;
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  showChildName = false,
  className,
}) => {
  const child = getChildById(activity.childId);
  const teacher = getUserById(activity.teacherId);

  const getMoodIcon = () => {
    switch (activity.mood) {
      case 'happy':
        return <Smile className="h-5 w-5 text-mood-happy" />;
      case 'sad':
        return <Frown className="h-5 w-5 text-mood-sad" />;
      case 'energetic':
        return <Zap className="h-5 w-5 text-mood-energetic" />;
      case 'tired':
        return <Battery className="h-5 w-5 text-mood-tired" />;
      case 'calm':
        return <Heart className="h-5 w-5 text-mood-calm" />;
    }
  };

  const getMoodLabel = () => {
    return activity.mood.charAt(0).toUpperCase() + activity.mood.slice(1);
  };

  return (
    <div className={cn('bg-card rounded-2xl border p-5 shadow-card', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {showChildName && child && (
            <h3 className="font-semibold text-foreground mb-2">{child.name}</h3>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {activity.arrivalTime} - {activity.pickupTime || 'Present'}
            </span>
            {activity.napDuration && (
              <span className="flex items-center gap-1">
                <Moon className="h-4 w-4" />
                {activity.napDuration}
              </span>
            )}
          </div>
          <p className="text-foreground">{activity.activities}</p>
          {activity.generalNotes && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{activity.generalNotes}"
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-muted rounded-xl">{getMoodIcon()}</div>
          <span className="text-xs font-medium text-muted-foreground">
            {getMoodLabel()}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Logged by {teacher?.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {format(new Date(activity.date), 'EEEE, MMM d')}
        </span>
      </div>
    </div>
  );
};
