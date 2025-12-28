import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MealLog } from '@/lib/mockData';
import { Coffee, Sun, Cookie, Moon } from 'lucide-react';

interface MealCardProps {
  meal: MealLog;
  className?: string;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, className }) => {
  const getMealIcon = () => {
    switch (meal.mealType) {
      case 'breakfast':
        return <Coffee className="h-5 w-5" />;
      case 'lunch':
        return <Sun className="h-5 w-5" />;
      case 'snack':
        return <Cookie className="h-5 w-5" />;
      case 'dinner':
        return <Moon className="h-5 w-5" />;
    }
  };

  const getMealLabel = () => {
    return meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1);
  };

  const getPortionBadge = () => {
    const styles = {
      all: 'bg-success-light text-success',
      most: 'bg-primary/10 text-primary',
      some: 'bg-warning-light text-warning-foreground',
      none: 'bg-destructive-light text-destructive',
    };

    const labels = {
      all: 'Ate all',
      most: 'Ate most',
      some: 'Ate some',
      none: 'Did not eat',
    };

    return (
      <Badge className={cn('font-medium', styles[meal.portionConsumed])}>
        {labels[meal.portionConsumed]}
      </Badge>
    );
  };

  return (
    <div className={cn('bg-card rounded-xl border p-4 shadow-card', className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          {getMealIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">{getMealLabel()}</h4>
            <span className="text-xs text-muted-foreground">{meal.timestamp}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {meal.foodItems.join(', ')}
          </p>
          <div className="flex items-center justify-between mt-2">
            {getPortionBadge()}
          </div>
          {meal.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Note: {meal.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
