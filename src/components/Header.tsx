import { User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Gusto
          </h1>
          <p className="text-xs text-muted-foreground font-body">
            Le tue esperienze
          </p>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
          <User className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
