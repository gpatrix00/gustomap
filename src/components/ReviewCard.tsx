import { Star, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  name: string;
  type: "ristorante" | "bar" | "caffetteria";
  rating: number;
  date: string;
  location: string;
  image: string;
  description: string;
  className?: string;
  onClick?: () => void;
}

const ReviewCard = ({
  name,
  type,
  rating,
  date,
  location,
  image,
  description,
  className,
  onClick,
}: ReviewCardProps) => {
  const typeLabels = {
    ristorante: "Ristorante",
    bar: "Bar",
    caffetteria: "Caffetteria",
  };

  return (
    <article
      onClick={onClick}
      className={cn(
        "group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in cursor-pointer",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-card/90 backdrop-blur-sm text-xs font-medium rounded-full text-foreground">
            {typeLabels[type]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < rating
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 font-body">
          {description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {date}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;
