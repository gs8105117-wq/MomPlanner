import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { insertNoteSchema, type Note, type InsertNote } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const noteFormSchema = insertNoteSchema.extend({
  datetime: z.string().min(1, "Data e hora são obrigatórias"),
}).omit({ userId: true });

type NoteFormData = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  note?: Note | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: "general", label: "Geral", description: "Momentos do dia a dia" },
  { value: "milestone", label: "Marco", description: "Conquistas importantes" },
  { value: "concern", label: "Preocupação", description: "Questões para observar" },
  { value: "medical", label: "Médico", description: "Informações de saúde" },
];

export default function NoteForm({ note, onSuccess, onCancel }: NoteFormProps) {
  const { toast } = useToast();
  const isEditing = !!note;

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      datetime: note ? format(new Date(note.datetime), "yyyy-MM-dd'T'HH:mm") : 
                format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      title: note?.title || "",
      content: note?.content || "",
      category: note?.category || "general",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const payload: InsertNote = {
        ...data,
        userId: "default-user",
        datetime: new Date(data.datetime),
        title: data.title || null,
        category: data.category || "general",
      };
      await apiRequest("POST", "/api/notes", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Sucesso",
        description: "Nota registrada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar nota",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const payload = {
        ...data,
        datetime: new Date(data.datetime),
        title: data.title || null,
        category: data.category || "general",
      };
      await apiRequest("PUT", `/api/notes/${note!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Sucesso",
        description: "Nota atualizada com sucesso",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar nota",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NoteFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="note-form">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? "Editar Nota" : "Nova Nota"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize sua nota especial" : "Registre um momento especial"}
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Primeiro sorriso, Nova palavra..."
                  {...field}
                  data-testid="input-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva este momento especial..."
                  className="min-h-[120px]"
                  {...field}
                  data-testid="textarea-content"
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
