import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingActionButton = ({ onClick, className }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground",
        "flex items-center justify-center shadow-elevated",
        "hover:scale-105 active:scale-95 transition-transform duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label="Aggiungi recensione"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};

export default FloatingActionButton;
