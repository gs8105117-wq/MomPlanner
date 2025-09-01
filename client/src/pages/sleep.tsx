import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Moon, Edit, Trash2, Play, Square } from "lucide-react";
import Header from "@/components/layout/header";
import SleepForm from "@/components/sleep/sleep-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SleepSession } from "@shared/schema";

export default function SleepPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SleepSession | null>(null);
  const { toast } = useToast();

  const { data: sleepSessions = [], isLoading } = useQuery<SleepSession[]>({
    queryKey: ["/api/sleep"],
  });

  const activeSessions = sleepSessions.filter(session => !session.endTime);
  const completedSessions = sleepSessions.filter(session => session.endTime);

  const endSleepMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/sleep/${id}`, {
        endTime: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
      toast({
        title: "Sucesso",
        description: "Soneca finalizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao finalizar soneca",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sleep/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sleep"] });
      toast({
        title: "Sucesso",
        description: "Soneca removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover soneca",
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

  const handleEdit = (session: SleepSession) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta soneca?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEndSleep = (id: string) => {
    endSleepMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Sono" />
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
    <div className="min-h-screen pb-24" data-testid="sleep-page">
      <Header title="Sono" />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Registro de Sono</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" size="sm" data-testid="add-sleep-button">
                <Plus className="w-4 h-4 mr-2" />
                Nova Soneca
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <SleepForm 
                session={editingSession} 
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingSession(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Sleep Sessions */}
        {activeSessions.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Play className="w-5 h-5 text-accent mr-2" />
              Soneca em Andamento
            </h3>
            {activeSessions.map((session) => (
              <Card key={session.id} className="card-shadow border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Moon className="w-5 h-5 text-accent mr-2" />
                        Soneca Ativa
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Iniciada às {format(new Date(session.startTime), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEndSleep(session.id)}
                      disabled={endSleepMutation.isPending}
                      data-testid={`end-sleep-${session.id}`}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Finalizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center bg-accent/10 rounded-lg p-4">
                    <p className="text-accent font-semibold">
                      Soneca em andamento...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Completed Sleep Sessions */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Histórico de Sono
          </h3>
          <div className="space-y-4">
            {completedSessions.length === 0 && activeSessions.length === 0 ? (
              <Card className="card-shadow">
                <CardContent className="p-8 text-center">
                  <Moon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma soneca registrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece registrando a primeira soneca do seu bebê
                  </p>
                  <Button onClick={() => setIsFormOpen(true)} data-testid="first-sleep-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar primeira soneca
                  </Button>
                </CardContent>
              </Card>
            ) : (
              completedSessions.map((session) => (
                <Card key={session.id} className="card-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <Moon className="w-5 h-5 text-primary mr-2" />
                          Soneca
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.startTime), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(session)}
                          data-testid={`edit-sleep-${session.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                          data-testid={`delete-sleep-${session.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Início</p>
                        <p className="font-medium">
                          {format(new Date(session.startTime), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fim</p>
                        <p className="font-medium">
                          {session.endTime ? format(new Date(session.endTime), "HH:mm", { locale: ptBR }) : "-"}
                        </p>
                      </div>
                      {session.duration && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Duração</p>
                          <p className="font-medium text-lg text-primary">
                            {Math.floor(session.duration / 60)}h {session.duration % 60}min
                          </p>
                        </div>
                      )}
                      {session.quality && (
                        <div>
                          <p className="text-muted-foreground">Qualidade</p>
                          <p className="font-medium capitalize">{session.quality}</p>
                        </div>
                      )}
                    </div>
                    {session.notes && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-muted-foreground text-sm mb-1">Observações</p>
                        <p className="text-sm">{session.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
