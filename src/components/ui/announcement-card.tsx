import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/useUsers';
import { Pin, Calendar, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface AnnouncementProps {
  id: string;
  title: string;
  content: string;
  authorId: string;
  priority: 'low' | 'normal' | 'high';
  eventDate?: string;
  isPinned: boolean;
  createdAt: string;
  targetAudience?: string;
  readBy?: string[];
}

interface AnnouncementCardProps {
  announcement: AnnouncementProps;
  className?: string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  className,
}) => {
  const { data: author } = useUser(announcement.authorId);

  const getPriorityStyles = () => {
    switch (announcement.priority) {
      case 'high':
        return 'border-l-4 border-l-destructive bg-destructive-light/30';
      case 'normal':
        return 'border-l-4 border-l-primary';
      default:
        return 'border-l-4 border-l-muted-foreground/30';
    }
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-4 shadow-card card-hover',
        getPriorityStyles(),
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {announcement.isPinned && (
              <Pin className="h-4 w-4 text-primary flex-shrink-0" />
            )}
            <h3 className="font-semibold text-foreground">{announcement.title}</h3>
            {announcement.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">
                <Bell className="h-3 w-3 mr-1" />
                Important
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {announcement.content}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>By {author?.full_name || 'Staff'}</span>
            <span>•</span>
            <span>{format(new Date(announcement.createdAt), 'MMM d, yyyy')}</span>
            {announcement.eventDate && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-primary">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(announcement.eventDate), 'MMM d')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
