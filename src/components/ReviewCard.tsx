import { Star, MapPin, Clock, Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignedUrls } from "@/hooks/useSignedUrls";

interface ReviewCardProps {
  name: string;
  type: "ristorante" | "bar" | "caffetteria";
  rating: number;
  date: string;
  location: string;
  images: string[];
  description: string;
  cuisineType?: string | null;
  visitStatus?: string | null;
  avgPricePerPerson?: number | null;
  className?: string;
  onClick?: () => void;
}

const CUISINE_LABELS: Record<string, string> = {
  italiana: "Italiana",
  giapponese: "Giapponese",
  cinese: "Cinese",
  messicana: "Messicana",
  indiana: "Indiana",
  thailandese: "Thailandese",
  americana: "Americana",
  francese: "Francese",
  greca: "Greca",
  spagnola: "Spagnola",
  mediterranea: "Mediterranea",
  pizza: "Pizzeria",
  sushi: "Sushi",
  steakhouse: "Steakhouse",
  pesce: "Pesce",
  vegetariana: "Vegetariana",
  altro: "Altro",
};

const ReviewCard = ({
  name,
  type,
  rating,
  date,
  location,
  images,
  description,
  cuisineType,
  visitStatus,
  avgPricePerPerson,
  className,
  onClick,
}: ReviewCardProps) => {
  const typeLabels = {
    ristorante: "Ristorante",
    bar: "Bar",
    caffetteria: "Caffetteria",
  };

  const resolvedImages = useSignedUrls(images);
  const coverImage = resolvedImages[0] || "/placeholder.svg";
  const isWishlist = visitStatus === "wishlist";

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
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={cn(
            "px-3 py-1 backdrop-blur-sm text-xs font-medium rounded-full",
            isWishlist
              ? "bg-accent/90 text-accent-foreground"
              : "bg-card/90 text-foreground"
          )}>
            {isWishlist ? "📌 Da provare" : typeLabels[type]}
          </span>
          {cuisineType && CUISINE_LABELS[cuisineType] && (
            <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-xs font-medium rounded-full text-primary-foreground">
              {CUISINE_LABELS[cuisineType]}
            </span>
          )}
          {resolvedImages.length > 1 && (
            <span className="px-2 py-1 bg-card/90 backdrop-blur-sm text-xs font-medium rounded-full text-foreground">
              +{images.length - 1}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {name}
          </h3>
          {!isWishlist && (
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
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 font-body">
            {description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
          {!isWishlist && date && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {date}
            </span>
          )}
          {avgPricePerPerson != null && (
            <span className="flex items-center gap-1">
              <Euro className="w-3.5 h-3.5" />
              {avgPricePerPerson}€
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;
