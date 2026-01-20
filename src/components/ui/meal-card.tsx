import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Coffee, Sun, Cookie, Moon } from 'lucide-react';

interface MealCardMeal {
  id: string;
  childId: string;
  date: string;
  mealType: string;
  foods: string[];
  portionEaten: string;
  notes?: string;
}

interface MealCardProps {
  meal: MealCardMeal;
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
      default:
        return <Coffee className="h-5 w-5" />;
    }
  };

  const getMealLabel = () => {
    return meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1) || 'Meal';
  };

  const getPortionBadge = () => {
    const styles: Record<string, string> = {
      all: 'bg-success/10 text-success',
      most: 'bg-primary/10 text-primary',
      some: 'bg-warning/10 text-warning',
      none: 'bg-destructive/10 text-destructive',
    };

    const labels: Record<string, string> = {
      all: 'Ate all',
      most: 'Ate most',
      some: 'Ate some',
      none: 'Did not eat',
    };

    const portion = meal.portionEaten || 'all';

    return (
      <Badge className={cn('font-medium', styles[portion] || styles.all)}>
        {labels[portion] || labels.all}
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
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {meal.foods?.join(', ') || 'No foods recorded'}
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
