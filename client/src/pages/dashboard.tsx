import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Clock, Lightbulb, UtensilsCrossed, StickyNote, Heart, Calendar, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Feeding, SleepSession, Task, Note } from "@shared/schema";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  const { data: feedings = [] } = useQuery<Feeding[]>({
    queryKey: ["/api/feedings", { date: today }],
  });

  const { data: sleepSessions = [] } = useQuery<SleepSession[]>({
    queryKey: ["/api/sleep", { date: today }],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { date: today }],
  });

  const { data: recentNotes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes", { limit: 3 }],
  });

  // Calculate next feeding time (assuming 3-hour intervals)
  const lastFeeding = feedings.length > 0 ? new Date(feedings[0].datetime) : null;
  const nextFeedingHours = lastFeeding 
    ? Math.max(0, Math.ceil((3 * 60 * 60 * 1000 - (Date.now() - lastFeeding.getTime())) / (60 * 60 * 1000)))
    : 0;

  // Calculate today's sleep sessions
  const todaySleepSessions = sleepSessions.filter(session => 
    isToday(new Date(session.startTime))
  );

  // Calculate completed tasks
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="min-h-screen pb-24" data-testid="dashboard-page">
      <Header />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Welcome Header */}
        <section className="mb-8">
          <Card className="card-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-10 h-10 text-white icon-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Olá, Marina!</h2>
                  <p className="text-muted-foreground">Como está o seu dia com o pequeno?</p>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoje é</span>
                <span className="text-sm font-semibold text-foreground">
                  {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground" data-testid="next-feeding-time">
                  {nextFeedingHours}h
                </p>
                <p className="text-xs text-muted-foreground">Próxima mamada</p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground" data-testid="sleep-sessions-count">
                  {todaySleepSessions.length}
                </p>
                <p className="text-xs text-muted-foreground">Sonecas hoje</p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground" data-testid="completed-tasks">
                  {completedTasks}/{tasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Tarefas feitas</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-primary mr-2" />
            Agenda de Hoje
          </h3>
          <div className="space-y-3">
            {feedings.slice(0, 2).map((feeding) => (
              <Card key={feeding.id} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium text-foreground">
                          Mamada - {feeding.side === 'left' ? 'Lado esquerdo' : 
                                   feeding.side === 'right' ? 'Lado direito' : 'Ambos lados'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {feeding.quantity}ml • {format(new Date(feeding.datetime), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Concluído
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {sleepSessions.slice(0, 1).map((session) => (
              <Card key={session.id} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <div>
                        <p className="font-medium text-foreground">Soneca</p>
                        <p className="text-sm text-muted-foreground">
                          {session.duration}min • {format(new Date(session.startTime), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                      {session.endTime ? 'Concluído' : 'Em andamento'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Plus className="w-5 h-5 text-primary mr-2" />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/feeding">
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                data-testid="quick-action-feeding"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Nova Mamada</p>
                  <p className="text-sm text-muted-foreground">Registrar agora</p>
                </div>
              </Button>
            </Link>

            <Link href="/sleep">
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                data-testid="quick-action-sleep"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-7 h-7 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Iniciar Sono</p>
                  <p className="text-sm text-muted-foreground">Registrar soneca</p>
                </div>
              </Button>
            </Link>

            <Link href="/meals">
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                data-testid="quick-action-meal"
              >
                <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                  <UtensilsCrossed className="w-7 h-7 text-secondary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Nova Refeição</p>
                  <p className="text-sm text-muted-foreground">Adicionar ao cardápio</p>
                </div>
              </Button>
            </Link>

            <Link href="/notes">
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                data-testid="quick-action-note"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <StickyNote className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Nova Nota</p>
                  <p className="text-sm text-muted-foreground">Momento especial</p>
                </div>
              </Button>
            </Link>
          </div>
        </section>

        {/* Recent Notes */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Heart className="w-5 h-5 text-primary mr-2" />
            Momentos Especiais
          </h3>
          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <Card className="card-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Nenhum momento especial registrado ainda.</p>
                  <Link href="/notes">
                    <Button variant="outline" className="mt-2" data-testid="add-first-note">
                      Adicionar primeira nota
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              recentNotes.map((note) => (
                <Card key={note.id} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Heart className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        {note.title && (
                          <h4 className="font-medium text-foreground mb-1">{note.title}</h4>
                        )}
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.datetime), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
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
