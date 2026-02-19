import { cn } from "@/lib/utils";

type FilterType = "tutti" | "ristoranti" | "bar";
type VisitFilter = "tutti" | "visited" | "wishlist";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  visitFilter?: VisitFilter;
  onVisitFilterChange?: (filter: VisitFilter) => void;
}

const FilterTabs = ({ activeFilter, onFilterChange, visitFilter = "tutti", onVisitFilterChange }: FilterTabsProps) => {
  const filters: { value: FilterType; label: string }[] = [
    { value: "tutti", label: "Tutti" },
    { value: "ristoranti", label: "Ristoranti" },
    { value: "bar", label: "Bar & Caffè" },
  ];

  const visitFilters: { value: VisitFilter; label: string }[] = [
    { value: "tutti", label: "Tutti" },
    { value: "visited", label: "✅ Visitati" },
    { value: "wishlist", label: "📌 Da provare" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeFilter === filter.value
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-muted"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {onVisitFilterChange && (
        <div className="flex gap-2">
          {visitFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onVisitFilterChange(filter.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                visitFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterTabs;
