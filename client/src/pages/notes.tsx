import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Heart, Edit, Trash2, Calendar, Star } from "lucide-react";
import Header from "@/components/layout/header";
import NoteForm from "@/components/notes/note-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Note } from "@shared/schema";

const categoryIcons = {
  milestone: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50", label: "Marco" },
  concern: { icon: Heart, color: "text-red-500", bg: "bg-red-50", label: "Preocupação" },
  medical: { icon: Heart, color: "text-blue-500", bg: "bg-blue-50", label: "Médico" },
  general: { icon: Heart, color: "text-primary", bg: "bg-primary/10", label: "Geral" },
};

export default function NotesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Sucesso",
        description: "Nota removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover nota",
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta nota?")) {
      deleteMutation.mutate(id);
    }
  };

  // Group notes by date
  const notesByDate = notes.reduce((acc, note) => {
    const dateKey = format(new Date(note.datetime), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const sortedDates = Object.keys(notesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Notas" />
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
    <div className="min-h-screen pb-24" data-testid="notes-page">
      <Header title="Notas" />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Momentos Especiais</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" size="sm" data-testid="add-note-button">
                <Plus className="w-4 h-4 mr-2" />
                Nova Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <NoteForm 
                note={editingNote} 
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingNote(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Card */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de momentos</p>
                <p className="text-2xl font-bold text-foreground">{notes.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(
                notes.reduce((acc, note) => {
                  acc[note.category || 'general'] = (acc[note.category || 'general'] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => {
                const categoryInfo = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.general;
                return (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {categoryInfo.label}: {count}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma nota registrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece registrando os momentos especiais do seu bebê
                </p>
                <Button onClick={() => setIsFormOpen(true)} data-testid="first-note-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar primeira nota
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((dateKey) => {
              const dayNotes = notesByDate[dateKey];
              const date = new Date(dateKey);
              
              return (
                <section key={dateKey}>
                  <div className="flex items-center mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {dayNotes.map((note) => {
                      const categoryInfo = categoryIcons[note.category as keyof typeof categoryIcons] || categoryIcons.general;
                      const IconComponent = categoryInfo.icon;
                      
                      return (
                        <Card key={note.id} className="card-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={`w-8 h-8 ${categoryInfo.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                                  <IconComponent className={`w-4 h-4 ${categoryInfo.color}`} />
                                </div>
                                <div className="flex-1">
                                  {note.title && (
                                    <CardTitle className="text-lg mb-1">{note.title}</CardTitle>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {categoryInfo.label}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(note.datetime), "HH:mm", { locale: ptBR })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(note)}
                                  data-testid={`edit-note-${note.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(note.id)}
                                  data-testid={`delete-note-${note.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-foreground leading-relaxed">{note.content}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
