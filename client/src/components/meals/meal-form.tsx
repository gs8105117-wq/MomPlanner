import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertMealSchema, type Meal, type InsertMeal } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const mealFormSchema = insertMealSchema.omit({ userId: true });

type MealFormData = z.infer<typeof mealFormSchema>;

interface MealFormProps {
  meal?: Meal | null;
  defaultDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const mealTypeOptions = [
  { value: "breakfast", label: "Café da Manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "afternoon_snack", label: "Lanche da Tarde" },
  { value: "dinner", label: "Jantar" },
];

export default function MealForm({ meal, defaultDate, onSuccess, onCancel }: MealFormProps) {
  const { toast } = useToast();
  const isEditing = !!meal?.id;

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      date: meal?.date || defaultDate || new Date().toISOString().split('T')[0],
      mealType: meal?.mealType || "breakfast",
      description: meal?.description || "",
      notes: meal?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MealFormData) => {
      const payload: InsertMeal = {
        ...data,
        userId: "default-user",
        notes: data.notes || null,
      };
      await apiRequest("POST", "/api/meals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Sucesso",
        description: "Refeição adicionada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar refeição",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: MealFormData) => {
      const payload = {
        ...data,
        notes: data.notes || null,
      };
      await apiRequest("PUT", `/api/meals/${meal!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Sucesso",
        description: "Refeição atualizada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar refeição",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MealFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="meal-form">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? "Editar Refeição" : "Nova Refeição"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize os dados da refeição" : "Adicione uma nova refeição ao cardápio"}
          </p>
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} data-testid="input-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mealType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Refeição</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-meal-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mealTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Refeição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Papinha de frutas, mingau de aveia..."
                  {...field}
                  data-testid="textarea-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais sobre a refeição..."
                  {...field}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1"
            data-testid="button-submit"
          >
            {isPending ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
