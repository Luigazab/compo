import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MealCard } from '@/components/ui/meal-card';
import { useChildren } from '@/hooks/useChildren';
import { useMealLogs, useCreateMealLog } from '@/hooks/useMealLogs';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Coffee, Sun, Cookie, Moon, Users, Check, Loader2 } from 'lucide-react';
import { cn, getFullName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'snack', label: 'Snack', icon: Cookie },
  { value: 'dinner', label: 'Dinner', icon: Moon },
];

const portions = [
  { value: 'all', label: 'Ate all', color: 'bg-success' },
  { value: 'most', label: 'Ate most', color: 'bg-primary' },
  { value: 'some', label: 'Ate some', color: 'bg-warning' },
  { value: 'none', label: 'Did not eat', color: 'bg-destructive' },
];

const commonFoods = [
  'Oatmeal',
  'Pancakes',
  'Fruit',
  'Vegetables',
  'Pasta',
  'Rice',
  'Chicken',
  'Fish',
  'Bread',
  'Milk',
  'Crackers',
  'Cheese',
  'Yogurt',
  'Soup',
];

const MealTrackingPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: mealLogs = [], isLoading: mealsLoading } = useMealLogs();
  const createMealLog = useCreateMealLog();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [mealType, setMealType] = useState('lunch');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [portion, setPortion] = useState('all');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChild = (childId: string) => {
    setSelectedChildren(prev =>
      prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]
    );
  };

  const toggleFood = (food: string) => {
    setSelectedFoods(prev =>
      prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
    );
  };

  const handleSubmit = async () => {
    if (!user || selectedChildren.length === 0 || selectedFoods.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Create meal log for each selected child
      for (const childId of selectedChildren) {
        await createMealLog.mutateAsync({
          child_id: childId,
          created_by: user.id,
          meal_type: mealType,
          food_items: selectedFoods.join(', '),
          portion_consumed: portion,
          notes: notes || null,
        });
      }
      
      toast({
        title: 'Meals logged!',
        description: `Logged ${mealType} for ${selectedChildren.length} students.`,
      });
      
      setShowForm(false);
      setSelectedChildren([]);
      setSelectedFoods([]);
      setNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log meals.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  // Group meals by child
  const mealsByChild = mealLogs.reduce((acc, meal) => {
    if (!acc[meal.child_id]) {
      acc[meal.child_id] = [];
    }
    acc[meal.child_id].push(meal);
    return acc;
  }, {} as Record<string, typeof mealLogs>);

  // Transform meal logs for MealCard component
  const transformMeal = (meal: typeof mealLogs[0]) => ({
    id: meal.id,
    childId: meal.child_id,
    date: meal.meal_date,
    mealType: meal.meal_type || 'lunch',
    foods: meal.food_items.split(', '),
    portionEaten: meal.portion_consumed || 'all',
    notes: meal.notes || undefined,
  });

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
      <PageHeader
        title="Meal Tracking"
        description="Log and track meals for your students"
        actions={
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Log Meals
          </Button>
        }
      />
      </div>

      {/* Bulk Meal Entry Form */}
      {showForm && (
        <Card className="mb-6 shadow-card border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Meal Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meal Type */}
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <div className="flex gap-2 flex-wrap">
                {mealTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setMealType(type.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl transition-all btn-bounce',
                      mealType === type.value
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Students */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Students</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedChildren(
                      selectedChildren.length === children.length
                        ? []
                        : children.map(c => c.id)
                    )
                  }
                >
                  {selectedChildren.length === children.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
              {childrenLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {children.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => toggleChild(child.id)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border transition-all text-left',
                        selectedChildren.includes(child.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded flex items-center justify-center',
                          selectedChildren.includes(child.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {selectedChildren.includes(child.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{getFullName(child.first_name, child.last_name)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Food Items */}
            <div className="space-y-2">
              <Label>Food Items</Label>
              <div className="flex flex-wrap gap-2">
                {commonFoods.map(food => (
                  <button
                    key={food}
                    type="button"
                    onClick={() => toggleFood(food)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-all',
                      selectedFoods.includes(food)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>

            {/* Portion */}
            <div className="space-y-2">
              <Label>Portion Consumed</Label>
              <div className="flex gap-2 flex-wrap">
                {portions.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPortion(p.value)}
                    className={cn(
                      'px-4 py-2 rounded-xl transition-all btn-bounce',
                      portion === p.value
                        ? `${p.color} text-white shadow-lg`
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional notes about the meal..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={selectedChildren.length === 0 || selectedFoods.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Log Meals ({selectedChildren.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Meal Logs */}
      {mealsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.slice(0, 6).map(child => {
            const childMeals = mealsByChild[child.id] || [];
            return (
              <Card key={child.id} className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    {getFullName(child.first_name, child.last_name)}
                    <Badge variant="secondary">{childMeals.length} meals</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {childMeals.length > 0 ? (
                    <div className="space-y-3">
                      {childMeals.map(meal => (
                        <MealCard key={meal.id} meal={transformMeal(meal)} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No meals logged today
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MealTrackingPage;
