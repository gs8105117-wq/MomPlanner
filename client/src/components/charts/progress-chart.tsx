import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Moon, UtensilsCrossed } from "lucide-react";
import type { Feeding, SleepSession, Meal } from "@shared/schema";

const COLORS = ['#6B8E23', '#F4A460', '#4682B4', '#8FBC8F'];

export default function ProgressChart() {
  const { data: feedings = [] } = useQuery<Feeding[]>({
    queryKey: ["/api/feedings"],
  });

  const { data: sleepSessions = [] } = useQuery<SleepSession[]>({
    queryKey: ["/api/sleep"],
  });

  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
  });

  // Calculate data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date,
      dateKey: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE", { locale: ptBR }),
    };
  }).reverse();

  // Prepare weekly progress data
  const weeklyData = last7Days.map(({ date, dateKey, label }) => {
    const dayFeedings = feedings.filter(f => 
      format(new Date(f.datetime), "yyyy-MM-dd") === dateKey
    );
    
    const daySleep = sleepSessions.filter(s => 
      format(new Date(s.startTime), "yyyy-MM-dd") === dateKey && s.duration
    );
    
    const dayMeals = meals.filter(m => m.date === dateKey);
    
    const totalSleepMinutes = daySleep.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalSleepHours = totalSleepMinutes / 60;

    return {
      day: label,
      feedings: dayFeedings.length,
      sleepHours: totalSleepHours,
      meals: dayMeals.length,
      date: dateKey,
    };
  });

  // Calculate feeding type distribution
  const feedingTypeData = feedings.reduce((acc, feeding) => {
    const type = feeding.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const feedingPieData = Object.entries(feedingTypeData).map(([type, count]) => ({
    name: type === 'breast' ? 'Peito' : type === 'formula' ? 'Fórmula' : 'Misto',
    value: count,
    type,
  }));

  // Calculate weekly totals
  const weeklyStats = {
    totalFeedings: weeklyData.reduce((acc, day) => acc + day.feedings, 0),
    totalSleepHours: weeklyData.reduce((acc, day) => acc + day.sleepHours, 0),
    totalMeals: weeklyData.reduce((acc, day) => acc + day.meals, 0),
    avgFeedingsPerDay: weeklyData.reduce((acc, day) => acc + day.feedings, 0) / 7,
  };

  return (
    <div className="space-y-6">
      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mamadas/semana</p>
                <p className="text-2xl font-bold text-primary">{weeklyStats.totalFeedings}</p>
                <p className="text-xs text-muted-foreground">
                  ~{weeklyStats.avgFeedingsPerDay.toFixed(1)}/dia
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sono/semana</p>
                <p className="text-2xl font-bold text-accent">{weeklyStats.totalSleepHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">
                  ~{(weeklyStats.totalSleepHours / 7).toFixed(1)}h/dia
                </p>
              </div>
              <Moon className="w-8 h-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 text-primary mr-2" />
            Atividades dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Bar dataKey="feedings" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="sleepHours" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="meals" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded mr-2"></div>
              <span>Mamadas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent rounded mr-2"></div>
              <span>Sono (h)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-secondary rounded mr-2"></div>
              <span>Refeições</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feeding Type Distribution */}
      {feedingPieData.length > 0 && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <UtensilsCrossed className="w-5 h-5 text-primary mr-2" />
              Distribuição dos Tipos de Mamada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedingPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {feedingPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4 text-sm">
              {feedingPieData.map((entry, index) => (
                <div key={entry.type} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span>{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
