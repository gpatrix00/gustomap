import { cn } from "@/lib/utils";

type FilterType = "tutti" | "ristoranti" | "bar";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  const filters: { value: FilterType; label: string }[] = [
    { value: "tutti", label: "Tutti" },
    { value: "ristoranti", label: "Ristoranti" },
    { value: "bar", label: "Bar & Caffè" },
  ];

  return (
    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
            activeFilter === filter.value
              ? "bg-foreground text-background"
              : "bg-secondary text-muted-foreground hover:bg-muted"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
