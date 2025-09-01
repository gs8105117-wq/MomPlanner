import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, UtensilsCrossed, Edit, Trash2, Calendar } from "lucide-react";
import Header from "@/components/layout/header";
import MealForm from "@/components/meals/meal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Meal } from "@shared/schema";

const mealTypes = [
  { id: "breakfast", label: "Café da Manhã", icon: "☀️" },
  { id: "lunch", label: "Almoço", icon: "🍽️" },
  { id: "afternoon_snack", label: "Lanche da Tarde", icon: "🍎" },
  { id: "dinner", label: "Jantar", icon: "🌙" },
];

export default function MealsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { toast } = useToast();

  const { data: meals = [], isLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Sucesso",
        description: "Refeição removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover refeição",
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMeal(null);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta refeição?")) {
      deleteMutation.mutate(id);
    }
  };

  const getMealsForDateAndType = (date: string, mealType: string) => {
    return meals.filter(meal => meal.date === date && meal.mealType === mealType);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Cardápio" />
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" data-testid="meals-page">
      <Header title="Cardápio" />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Cardápio Semanal</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" size="sm" data-testid="add-meal-button">
                <Plus className="w-4 h-4 mr-2" />
                Nova Refeição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <MealForm 
                meal={editingMeal} 
                defaultDate={selectedDate}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingMeal(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 overflow-x-auto">
            {weekDays.slice(0, 4).map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              return (
                <TabsTrigger 
                  key={dateStr} 
                  value={dateStr} 
                  className="text-xs px-2"
                  data-testid={`tab-${dateStr}`}
                >
                  <div className="text-center">
                    <p className="font-medium">{format(day, "dd/MM")}</p>
                    <p className="text-xs opacity-70">{format(day, "EEE", { locale: ptBR })}</p>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {weekDays.slice(4).map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              return (
                <Button
                  key={dateStr}
                  variant={selectedDate === dateStr ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(dateStr)}
                  className="h-auto py-2"
                  data-testid={`day-button-${dateStr}`}
                >
                  <div className="text-center">
                    <p className="text-xs font-medium">{format(day, "dd/MM")}</p>
                    <p className="text-xs opacity-70">{format(day, "EEE", { locale: ptBR })}</p>
                  </div>
                </Button>
              );
            })}
          </div>

          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            return (
              <TabsContent key={dateStr} value={dateStr} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                </div>

                {mealTypes.map(({ id, label, icon }) => {
                  const dayMeals = getMealsForDateAndType(dateStr, id);
                  
                  return (
                    <Card key={id} className="card-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center">
                            <span className="text-xl mr-2">{icon}</span>
                            {label}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setEditingMeal({
                                id: "",
                                userId: "",
                                date: dateStr,
                                mealType: id,
                                description: "",
                                notes: "",
                                createdAt: new Date(),
                              } as Meal);
                              setIsFormOpen(true);
                            }}
                            data-testid={`add-${id}-${dateStr}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {dayMeals.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma refeição planejada</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayMeals.map((meal) => (
                              <div
                                key={meal.id}
                                className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{meal.description}</p>
                                  {meal.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{meal.notes}</p>
                                  )}
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(meal)}
                                    data-testid={`edit-meal-${meal.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(meal.id)}
                                    data-testid={`delete-meal-${meal.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
