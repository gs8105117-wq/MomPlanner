import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Clock, Edit, Trash2 } from "lucide-react";
import Header from "@/components/layout/header";
import FeedingForm from "@/components/feeding/feeding-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Feeding } from "@shared/schema";

export default function FeedingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeeding, setEditingFeeding] = useState<Feeding | null>(null);
  const { toast } = useToast();

  const { data: feedings = [], isLoading } = useQuery<Feeding[]>({
    queryKey: ["/api/feedings"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/feedings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedings"] });
      toast({
        title: "Sucesso",
        description: "Mamada removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover mamada",
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingFeeding(null);
  };

  const handleEdit = (feeding: Feeding) => {
    setEditingFeeding(feeding);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta mamada?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Mamadas" />
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
    <div className="min-h-screen pb-24" data-testid="feeding-page">
      <Header title="Mamadas" />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Histórico de Mamadas</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" size="sm" data-testid="add-feeding-button">
                <Plus className="w-4 h-4 mr-2" />
                Nova Mamada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <FeedingForm 
                feeding={editingFeeding} 
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingFeeding(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {feedings.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma mamada registrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece registrando a primeira mamada do seu bebê
                </p>
                <Button onClick={() => setIsFormOpen(true)} data-testid="first-feeding-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar primeira mamada
                </Button>
              </CardContent>
            </Card>
          ) : (
            feedings.map((feeding) => (
              <Card key={feeding.id} className="card-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Clock className="w-5 h-5 text-primary mr-2" />
                        {feeding.type === 'breast' ? 'Peito' : 
                         feeding.type === 'formula' ? 'Fórmula' : 'Misto'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(feeding.datetime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(feeding)}
                        data-testid={`edit-feeding-${feeding.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feeding.id)}
                        data-testid={`delete-feeding-${feeding.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {feeding.quantity && (
                      <div>
                        <p className="text-muted-foreground">Quantidade</p>
                        <p className="font-medium">{feeding.quantity}ml</p>
                      </div>
                    )}
                    {feeding.duration && (
                      <div>
                        <p className="text-muted-foreground">Duração</p>
                        <p className="font-medium">{feeding.duration} min</p>
                      </div>
                    )}
                    {feeding.side && (
                      <div>
                        <p className="text-muted-foreground">Lado</p>
                        <p className="font-medium">
                          {feeding.side === 'left' ? 'Esquerdo' : 
                           feeding.side === 'right' ? 'Direito' : 'Ambos'}
                        </p>
                      </div>
                    )}
                  </div>
                  {feeding.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-muted-foreground text-sm mb-1">Observações</p>
                      <p className="text-sm">{feeding.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
