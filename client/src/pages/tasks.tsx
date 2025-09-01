import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, CheckSquare, Calendar } from "lucide-react";
import Header from "@/components/layout/header";
import TaskItem from "@/components/tasks/task-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Task, InsertTask } from "@shared/schema";

const taskCategories = [
  { value: "diaper", label: "Fralda", icon: "🍼" },
  { value: "bath", label: "Banho", icon: "🛁" },
  { value: "appointment", label: "Consulta", icon: "👩‍⚕️" },
  { value: "vaccine", label: "Vacina", icon: "💉" },
  { value: "other", label: "Outros", icon: "📝" },
];

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<string>("other");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { date: selectedDate }],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Omit<InsertTask, "userId">) => {
      const payload: InsertTask = {
        ...data,
        userId: "default-user",
      };
      await apiRequest("POST", "/api/tasks", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskCategory("other");
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar tarefa",
        variant: "destructive",
      });
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o título da tarefa",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      date: selectedDate,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || null,
      category: newTaskCategory as any,
      completed: false,
      priority: "medium",
    });
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Tarefas" />
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
    <div className="min-h-screen pb-24" data-testid="tasks-page">
      <Header title="Tarefas" />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Tarefas Diárias</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              data-testid="date-picker"
            />
          </div>
        </div>

        {/* Add New Task Section */}
        <Card className="card-shadow mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Plus className="w-5 h-5 text-primary mr-2" />
              Adicionar Nova Tarefa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Título da tarefa..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                data-testid="input-task-title"
              />
              
              <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                <SelectTrigger data-testid="select-task-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Descrição (opcional)..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                data-testid="input-task-description"
              />
            </div>
            
            <Button
              onClick={handleAddTask}
              disabled={createTaskMutation.isPending}
              className="w-full"
              data-testid="button-add-task"
            >
              {createTaskMutation.isPending ? "Adicionando..." : "Adicionar Tarefa"}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso do dia</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedTasks.length}/{tasks.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-primary" />
              </div>
            </div>
            {tasks.length > 0 && (
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Tarefas Pendentes ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Tarefas Concluídas ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card className="card-shadow">
            <CardContent className="p-8 text-center">
              <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma tarefa para hoje
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando suas primeiras tarefas do dia
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
