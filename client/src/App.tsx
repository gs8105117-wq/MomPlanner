import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Feeding from "@/pages/feeding";
import Sleep from "@/pages/sleep";
import Meals from "@/pages/meals";
import Tasks from "@/pages/tasks";
import Notes from "@/pages/notes";
import BottomNavigation from "@/components/layout/bottom-navigation";

function Router() {
  return (
    <div className="gradient-bg min-h-screen">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/feeding" component={Feeding} />
        <Route path="/sleep" component={Sleep} />
        <Route path="/meals" component={Meals} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/notes" component={Notes} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
