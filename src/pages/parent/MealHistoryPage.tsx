import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MealCard } from '@/components/ui/meal-card';
import { 
  getChildrenByParent, 
  mockMealLogs, 
  getChildById,
  MealLog 
} from '@/lib/mockData';
import { 
  Filter,
  Download,
  TrendingUp,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const MealHistoryPage: React.FC = () => {
  const children = getChildrenByParent('parent-1');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const childIds = children.map(c => c.id);

  // Extended mock data for better calendar view
  const allMeals: MealLog[] = [
    ...mockMealLogs,
    { id: 'meal-6', childId: 'child-1', date: '2024-12-27', mealType: 'breakfast', foodItems: ['Cereal', 'Milk', 'Orange Juice'], portionConsumed: 'all', timestamp: '08:30' },
    { id: 'meal-7', childId: 'child-1', date: '2024-12-27', mealType: 'lunch', foodItems: ['Chicken Nuggets', 'Carrots', 'Rice'], portionConsumed: 'most', timestamp: '12:15' },
    { id: 'meal-8', childId: 'child-5', date: '2024-12-28', mealType: 'breakfast', foodItems: ['Yogurt', 'Berries', 'Granola'], portionConsumed: 'all', timestamp: '09:00' },
    { id: 'meal-9', childId: 'child-5', date: '2024-12-28', mealType: 'lunch', foodItems: ['Sandwich', 'Fruit Cup', 'Milk'], portionConsumed: 'some', notes: 'Not very hungry', timestamp: '12:00' },
  ];

  const filteredMeals = allMeals.filter(meal => {
    const matchesChild = selectedChild === 'all' ? childIds.includes(meal.childId) : meal.childId === selectedChild;
    const matchesType = mealTypeFilter === 'all' || meal.mealType === mealTypeFilter;
    const matchesDate = selectedDate ? isSameDay(parseISO(meal.date), selectedDate) : true;
    return matchesChild && matchesType && matchesDate;
  });

  // Calculate portion trends
  const portionStats = allMeals
    .filter(m => childIds.includes(m.childId))
    .reduce((acc, meal) => {
      acc[meal.portionConsumed] = (acc[meal.portionConsumed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const totalMeals = Object.values(portionStats).reduce((a, b) => a + b, 0);

  const getMealIcon = (type: string) => {
    const icons = {
      breakfast: <Coffee className="h-4 w-4" />,
      lunch: <UtensilsCrossed className="h-4 w-4" />,
      snack: <Cookie className="h-4 w-4" />,
      dinner: <Moon className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <UtensilsCrossed className="h-4 w-4" />;
  };

  // Get days with meals for calendar highlighting
  const daysWithMeals = allMeals
    .filter(m => childIds.includes(m.childId))
    .map(m => parseISO(m.date));

  const handleExport = () => {
    toast({
      title: "Exporting meal data",
      description: "Your meal history is being prepared for download."
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Meal History"
        description="View your children's meal logs and nutrition trends"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Filters */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasMeals: daysWithMeals
              }}
              modifiersStyles={{
                hasMeals: { fontWeight: 'bold', color: 'hsl(var(--primary))' }
              }}
            />

            <div className="mt-6 space-y-4">
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meals</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export Meal Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Portion Consumption Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-xl">
                  <p className="text-2xl font-bold text-success">{portionStats['all'] || 0}</p>
                  <p className="text-sm text-muted-foreground">Ate All</p>
                  <p className="text-xs text-success">{totalMeals > 0 ? Math.round(((portionStats['all'] || 0) / totalMeals) * 100) : 0}%</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{portionStats['most'] || 0}</p>
                  <p className="text-sm text-muted-foreground">Ate Most</p>
                  <p className="text-xs text-primary">{totalMeals > 0 ? Math.round(((portionStats['most'] || 0) / totalMeals) * 100) : 0}%</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-xl">
                  <p className="text-2xl font-bold text-warning">{portionStats['some'] || 0}</p>
                  <p className="text-sm text-muted-foreground">Ate Some</p>
                  <p className="text-xs text-warning">{totalMeals > 0 ? Math.round(((portionStats['some'] || 0) / totalMeals) * 100) : 0}%</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-xl">
                  <p className="text-2xl font-bold text-destructive">{portionStats['none'] || 0}</p>
                  <p className="text-sm text-muted-foreground">Ate None</p>
                  <p className="text-xs text-destructive">{totalMeals > 0 ? Math.round(((portionStats['none'] || 0) / totalMeals) * 100) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary */}
          {selectedDate && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMeals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No meals recorded for this date.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredMeals.map(meal => {
                      const child = getChildById(meal.childId);
                      return (
                        <div key={meal.id} className="p-4 bg-muted rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-background rounded-lg">
                                {getMealIcon(meal.mealType)}
                              </div>
                              <div>
                                <p className="font-semibold capitalize">{meal.mealType}</p>
                                <p className="text-sm text-muted-foreground">
                                  {child?.name} • {meal.timestamp}
                                </p>
                              </div>
                            </div>
                            <Badge className={cn(
                              meal.portionConsumed === 'all' && 'bg-success text-success-foreground',
                              meal.portionConsumed === 'most' && 'bg-primary text-primary-foreground',
                              meal.portionConsumed === 'some' && 'bg-warning text-warning-foreground',
                              meal.portionConsumed === 'none' && 'bg-destructive text-destructive-foreground'
                            )}>
                              Ate {meal.portionConsumed}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {meal.foodItems.map((item, idx) => (
                              <Badge key={idx} variant="outline">{item}</Badge>
                            ))}
                          </div>
                          {meal.notes && (
                            <p className="text-sm italic text-muted-foreground">
                              Note: {meal.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MealHistoryPage;
