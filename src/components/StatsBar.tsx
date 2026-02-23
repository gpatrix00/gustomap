import { Utensils, Coffee, Star } from "lucide-react";

interface StatsBarProps {
  totalReviews: number;
  restaurants: number;
  bars: number;
  avgRating: number;
}

const StatsBar = ({ totalReviews, restaurants, bars, avgRating }: StatsBarProps) => {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-card rounded-lg shadow-soft">
      <div className="text-center">
        <p className="text-2xl font-display font-semibold text-foreground">{totalReviews}</p>
        <p className="text-xs text-muted-foreground">Recensioni</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Utensils className="w-4 h-4 text-primary" />
          <span className="text-2xl font-display font-semibold text-foreground">{restaurants}</span>
        </div>
        <p className="text-xs text-muted-foreground">Ristoranti</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Coffee className="w-4 h-4 text-primary" />
          <span className="text-2xl font-display font-semibold text-foreground">{bars}</span>
        </div>
        <p className="text-xs text-muted-foreground">Bar</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="text-2xl font-display font-semibold text-foreground">{avgRating.toFixed(1)}</span>
        </div>
        <p className="text-xs text-muted-foreground">Media</p>
      </div>
    </div>
  );
};

export default StatsBar;
