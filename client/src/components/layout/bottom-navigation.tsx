import { Link, useLocation } from "wouter";
import { Home, Clock, UtensilsCrossed, Moon, CheckSquare } from "lucide-react";

const navigationItems = [
  { path: "/", label: "Início", icon: Home },
  { path: "/feeding", label: "Mamadas", icon: Clock },
  { path: "/meals", label: "Cardápio", icon: UtensilsCrossed },
  { path: "/sleep", label: "Sono", icon: Moon },
  { path: "/tasks", label: "Tarefas", icon: CheckSquare },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-sm bg-opacity-95 z-50" data-testid="bottom-navigation">
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navigationItems.map(({ path, label, icon: Icon }) => {
            const isActive = location === path;
            return (
              <Link
                key={path}
                href={path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
