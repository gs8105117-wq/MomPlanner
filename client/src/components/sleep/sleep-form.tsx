import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { insertSleepSessionSchema, type SleepSession, type InsertSleepSession } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const sleepFormSchema = insertSleepSessionSchema.extend({
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().optional(),
}).omit({ userId: true });

type SleepFormData = z.infer<typeof sleepFormSchema>;

interface SleepFormProps {
  session?: SleepSession | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SleepForm({ session, onSuccess, onCancel }: SleepFormProps) {
  const { toast } = useToast();
  const isEditing = !!session;

  const form = useForm<SleepFormData>({
    resolver: zodResolver(sleepFormSchema),
    defaultValues: {
      startTime: session ? format(new Date(session.startTime), "yyyy-MM-dd'T'HH:mm") : 
                 format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: session?.endTime ? format(new Date(session.endTime), "yyyy-MM-dd'T'HH:mm") : "",
      quality: session?.quality || undefined,
      notes: session?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SleepFormData) => {
      const payload: InsertSleepSession = {
        userId: "default-user",
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        quality: data.quality || null,
        notes: data.notes || null,
      };
      await apiRequest("POST", "/api/sleep", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
      toast({
        title: "Sucesso",
        description: "Soneca registrada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar soneca",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SleepFormData) => {
      const payload = {
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        quality: data.quality || null,
        notes: data.notes || null,
      };
      await apiRequest("PUT", `/api/sleep/${session!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
      toast({
        title: "Sucesso",
        description: "Soneca atualizada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar soneca",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SleepFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="sleep-form">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? "Editar Soneca" : "Nova Soneca"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize os dados da soneca" : "Registre uma nova soneca"}
          </p>
        </div>

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Início</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} data-testid="input-start-time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Fim (opcional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} data-testid="input-end-time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualidade do Sono</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger data-testid="select-quality">
                    <SelectValue placeholder="Selecione a qualidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="excellent">Excelente</SelectItem>
                  <SelectItem value="good">Boa</SelectItem>
                  <SelectItem value="fair">Regular</SelectItem>
                  <SelectItem value="poor">Ruim</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Observações sobre o sono..."
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
