import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useParentChildren } from '@/hooks/useChildren';
import { useMealLogs } from '@/hooks/useMealLogs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download,
  TrendingUp,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  List,
  CalendarIcon,
  Loader2
} from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const MealHistoryPage: React.FC = () => {
  const { profile } = useSupabaseAuth();
  const { data: children = [], isLoading: loadingChildren } = useParentChildren(profile?.id);
  const { data: allMealLogs = [], isLoading: loadingMeals } = useMealLogs();
  
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const childIds = children.map(c => c.id);

  // Filter meals for this parent's children
  const myMeals = allMealLogs.filter(meal => childIds.includes(meal.child_id));

  const filteredMeals = myMeals.filter(meal => {
    const matchesChild = selectedChild === 'all' || meal.child_id === selectedChild;
    const matchesType = mealTypeFilter === 'all' || meal.meal_type === mealTypeFilter;
    const matchesDate = selectedDate ? isSameDay(parseISO(meal.meal_date), selectedDate) : true;
    return matchesChild && matchesType && matchesDate;
  });

  // Calculate portion trends
  const portionStats = myMeals.reduce((acc, meal) => {
    const portion = meal.portion_consumed || 'some';
    acc[portion] = (acc[portion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMeals = Object.values(portionStats).reduce((a, b) => a + b, 0);

  const getMealIcon = (type: string | null) => {
    const icons = {
      breakfast: <Coffee className="h-4 w-4" />,
      lunch: <UtensilsCrossed className="h-4 w-4" />,
      snack: <Cookie className="h-4 w-4" />,
      dinner: <Moon className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <UtensilsCrossed className="h-4 w-4" />;
  };

  // Get days with meals for calendar highlighting
  const daysWithMeals = myMeals.map(m => parseISO(m.meal_date));

  const handleExport = () => {
    toast({
      title: "Exporting meal data",
      description: "Your meal history is being prepared for download."
    });
  };

  const isLoading = loadingChildren || loadingMeals;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
      <PageHeader
        title="Meal History"
        description="View your children's meal logs and nutrition trends"
      />

      {/* View Toggle and Filters */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.first_name} {child.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                <SelectTrigger className="w-36">
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

              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
              <TabsList>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Stats */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Portion Consumption Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border pointer-events-auto w-full max-w-[350px] flex justify-center"
                modifiers={{
                  hasMeals: daysWithMeals
                }}
                modifiersStyles={{
                  hasMeals: { fontWeight: 'bold', color: 'hsl(var(--primary))' }
                }}
              />
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card className="shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-center text-muted-foreground py-8">
                  Select a date to view meals.
                </p>
              ) : filteredMeals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No meals recorded for this date.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredMeals.map(meal => {
                    const child = children.find(c => c.id === meal.child_id);
                    return (
                      <div key={meal.id} className="p-4 bg-muted rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-lg">
                              {getMealIcon(meal.meal_type)}
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{meal.meal_type || 'Meal'}</p>
                              <p className="text-sm text-muted-foreground">
                                {child ? `${child.first_name} ${child.last_name}` : 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(
                            meal.portion_consumed === 'all' && 'bg-success text-success-foreground',
                            meal.portion_consumed === 'most' && 'bg-primary text-primary-foreground',
                            meal.portion_consumed === 'some' && 'bg-warning text-warning-foreground',
                            meal.portion_consumed === 'none' && 'bg-destructive text-destructive-foreground'
                          )}>
                            Ate {meal.portion_consumed || 'some'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meal.food_items.split(',').map((item, idx) => (
                            <Badge key={idx} variant="outline">{item.trim()}</Badge>
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
        </div>
      ) : (
        /* List View */
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">All Meals</CardTitle>
          </CardHeader>
          <CardContent>
            {myMeals
              .filter(meal => {
                const matchesChild = selectedChild === 'all' || meal.child_id === selectedChild;
                const matchesType = mealTypeFilter === 'all' || meal.meal_type === mealTypeFilter;
                return matchesChild && matchesType;
              })
              .sort((a, b) => new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime())
              .length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No meals found.
              </p>
            ) : (
              <div className="space-y-4">
                {myMeals
                  .filter(meal => {
                    const matchesChild = selectedChild === 'all' || meal.child_id === selectedChild;
                    const matchesType = mealTypeFilter === 'all' || meal.meal_type === mealTypeFilter;
                    return matchesChild && matchesType;
                  })
                  .sort((a, b) => new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime())
                  .map(meal => {
                    const child = children.find(c => c.id === meal.child_id);
                    return (
                      <div key={meal.id} className="p-4 bg-muted rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-lg">
                              {getMealIcon(meal.meal_type)}
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{meal.meal_type || 'Meal'}</p>
                              <p className="text-sm text-muted-foreground">
                                {child ? `${child.first_name} ${child.last_name}` : 'Unknown'} • {format(parseISO(meal.meal_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(
                            meal.portion_consumed === 'all' && 'bg-success text-success-foreground',
                            meal.portion_consumed === 'most' && 'bg-primary text-primary-foreground',
                            meal.portion_consumed === 'some' && 'bg-warning text-warning-foreground',
                            meal.portion_consumed === 'none' && 'bg-destructive text-destructive-foreground'
                          )}>
                            Ate {meal.portion_consumed || 'some'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meal.food_items.split(',').map((item, idx) => (
                            <Badge key={idx} variant="outline">{item.trim()}</Badge>
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
    </DashboardLayout>
  );
};

export default MealHistoryPage;
