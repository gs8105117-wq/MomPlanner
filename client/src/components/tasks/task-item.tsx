import { useMutation } from "@tanstack/react-query";
import { Check, Edit, Trash2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
}

const categoryIcons = {
  diaper: "🍼",
  bath: "🛁",
  appointment: "👩‍⚕️",
  vaccine: "💉",
  other: "📝",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export default function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();

  const toggleCompletedMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      await apiRequest("PUT", `/api/tasks/${task.id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Sucesso",
        description: task.completed ? "Tarefa marcada como pendente" : "Tarefa concluída",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Sucesso",
        description: "Tarefa removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tarefa",
        variant: "destructive",
      });
    },
  });

  const handleToggleCompleted = () => {
    toggleCompletedMutation.mutate(!task.completed);
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja remover esta tarefa?")) {
      deleteMutation.mutate();
    }
  };

  const categoryIcon = categoryIcons[task.category as keyof typeof categoryIcons] || categoryIcons.other;
  const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium;
  const priorityLabel = priorityLabels[task.priority as keyof typeof priorityLabels] || priorityLabels.medium;

  return (
    <Card 
      className={`card-shadow transition-all duration-200 ${
        task.completed ? "opacity-70 bg-muted/30" : "hover:shadow-md"
      }`}
      data-testid={`task-item-${task.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleCompleted}
              disabled={toggleCompletedMutation.isPending}
              className="mt-1"
              data-testid={`checkbox-task-${task.id}`}
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{categoryIcon}</span>
                <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </h4>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${priorityColor}`}
                >
                  {priorityLabel}
                </Badge>
              </div>
              
              {task.description && (
                <p className={`text-sm ${task.completed ? "text-muted-foreground" : "text-muted-foreground"} mb-2`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                <span>
                  Criada em {new Date(task.createdAt!).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid={`delete-task-${task.id}`}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        
        {task.completed && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center text-xs text-muted-foreground">
              <Check className="w-3 h-3 mr-1 text-primary" />
              <span>Tarefa concluída</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
