import { MoreVertical, Heart } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "MomPlanner" }: HeaderProps) {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95" data-testid="header">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" data-testid="menu-button">
            <MoreVertical className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </div>
    </nav>
  );
}
