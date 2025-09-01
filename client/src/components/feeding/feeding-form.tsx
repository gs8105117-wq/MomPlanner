import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { insertFeedingSchema, type Feeding, type InsertFeeding } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const feedingFormSchema = insertFeedingSchema.extend({
  datetime: z.string().min(1, "Data e hora são obrigatórias"),
}).omit({ userId: true });

type FeedingFormData = z.infer<typeof feedingFormSchema>;

interface FeedingFormProps {
  feeding?: Feeding | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FeedingForm({ feeding, onSuccess, onCancel }: FeedingFormProps) {
  const { toast } = useToast();
  const isEditing = !!feeding;

  const form = useForm<FeedingFormData>({
    resolver: zodResolver(feedingFormSchema),
    defaultValues: {
      datetime: feeding ? format(new Date(feeding.datetime), "yyyy-MM-dd'T'HH:mm") : 
                format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: feeding?.type || "breast",
      quantity: feeding?.quantity || undefined,
      duration: feeding?.duration || undefined,
      side: feeding?.side || undefined,
      notes: feeding?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FeedingFormData) => {
      const payload: InsertFeeding = {
        ...data,
        userId: "default-user",
        datetime: new Date(data.datetime),
        quantity: data.quantity || null,
        duration: data.duration || null,
        side: data.side || null,
        notes: data.notes || null,
      };
      await apiRequest("POST", "/api/feedings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedings"] });
      toast({
        title: "Sucesso",
        description: "Mamada registrada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar mamada",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FeedingFormData) => {
      const payload = {
        ...data,
        datetime: new Date(data.datetime),
        quantity: data.quantity || null,
        duration: data.duration || null,
        side: data.side || null,
        notes: data.notes || null,
      };
      await apiRequest("PUT", `/api/feedings/${feeding!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedings"] });
      toast({
        title: "Sucesso",
        description: "Mamada atualizada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar mamada",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedingFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="feeding-form">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? "Editar Mamada" : "Nova Mamada"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize os dados da mamada" : "Registre uma nova mamada"}
          </p>
        </div>

        <FormField
          control={form.control}
          name="datetime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} data-testid="input-datetime" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="breast">Peito</SelectItem>
                  <SelectItem value="formula">Fórmula</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("type") === "breast" && (
          <FormField
            control={form.control}
            name="side"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-side">
                      <SelectValue placeholder="Selecione o lado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="left">Esquerdo</SelectItem>
                    <SelectItem value="right">Direito</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (ml)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="150"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    value={field.value || ""}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="20"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    value={field.value || ""}
                    data-testid="input-duration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a mamada..."
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
