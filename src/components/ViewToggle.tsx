import { cn } from "@/lib/utils";
import { List, Map } from "lucide-react";

type ViewMode = "list" | "map";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ViewToggle = ({ mode, onChange }: ViewToggleProps) => {
  return (
    <div className="flex bg-secondary rounded-full p-1">
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
          mode === "list"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="w-4 h-4" />
        Lista
      </button>
      <button
        onClick={() => onChange("map")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
          mode === "map"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Map className="w-4 h-4" />
        Mappa
      </button>
    </div>
  );
};

export default ViewToggle;
