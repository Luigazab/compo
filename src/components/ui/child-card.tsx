import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Child, getClassroomById } from '@/lib/mockData';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ChildCardProps {
  child: Child;
  showLogStatus?: boolean;
  logStatus?: 'completed' | 'pending' | 'none';
  linkTo?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  showLogStatus = false,
  logStatus = 'none',
  linkTo,
  variant = 'default',
  className,
}) => {
  const classroom = getClassroomById(child.classroomId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getLogStatusIcon = () => {
    switch (logStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const content = (
    <div
      className={cn(
        'bg-card rounded-2xl border p-4 shadow-card card-hover',
        variant === 'compact' ? 'flex items-center gap-3' : '',
        className
      )}
    >
      <Avatar className={cn(variant === 'compact' ? 'h-10 w-10' : 'h-16 w-16 mx-auto')}>
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
          {getInitials(child.name)}
        </AvatarFallback>
      </Avatar>

      <div className={cn(variant === 'compact' ? 'flex-1' : 'text-center mt-3')}>
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-semibold text-foreground">{child.name}</h3>
          {showLogStatus && getLogStatusIcon()}
        </div>
        <p className="text-sm text-muted-foreground">{child.age} years old</p>
        {classroom && variant === 'default' && (
          <Badge variant="secondary" className="mt-2">
            {classroom.name}
          </Badge>
        )}
      </div>

      {child.allergies.length > 0 && variant === 'default' && (
        <div className="mt-3 flex items-center justify-center gap-1 text-warning">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">Allergies</span>
        </div>
      )}

      {variant === 'compact' && child.allergies.length > 0 && (
        <div className="flex items-center gap-1 text-warning">
          <AlertTriangle className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {content}
      </Link>
    );
  }

  return content;
};
