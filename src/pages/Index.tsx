import { useState } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import FilterTabs from "@/components/FilterTabs";
import ReviewCard from "@/components/ReviewCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import { toast } from "sonner";

import restaurant1 from "@/assets/restaurant-1.jpg";
import bar1 from "@/assets/bar-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";

type FilterType = "tutti" | "ristoranti" | "bar";

interface Review {
  id: string;
  name: string;
  type: "ristorante" | "bar" | "caffetteria";
  rating: number;
  date: string;
  location: string;
  image: string;
  description: string;
}

const mockReviews: Review[] = [
  {
    id: "1",
    name: "Trattoria del Borgo",
    type: "ristorante",
    rating: 5,
    date: "2 giorni fa",
    location: "Milano Centro",
    image: restaurant1,
    description: "Esperienza incredibile. La pasta fatta in casa era semplicemente divina, servizio impeccabile.",
  },
  {
    id: "2",
    name: "Caffè Florian",
    type: "caffetteria",
    rating: 4,
    date: "1 settimana fa",
    location: "Venezia",
    image: bar1,
    description: "Atmosfera magica, caffè ottimo. Prezzi un po' alti ma ne vale la pena per l'esperienza.",
  },
  {
    id: "3",
    name: "Osteria Francescana",
    type: "ristorante",
    rating: 5,
    date: "2 settimane fa",
    location: "Modena",
    image: restaurant2,
    description: "Una delle migliori esperienze culinarie della mia vita. Ogni piatto un capolavoro.",
  },
];

const Index = () => {
  const [filter, setFilter] = useState<FilterType>("tutti");
  const [reviews] = useState<Review[]>(mockReviews);

  const filteredReviews = reviews.filter((review) => {
    if (filter === "tutti") return true;
    if (filter === "ristoranti") return review.type === "ristorante";
    if (filter === "bar") return review.type === "bar" || review.type === "caffetteria";
    return true;
  });

  const stats = {
    totalReviews: reviews.length,
    restaurants: reviews.filter((r) => r.type === "ristorante").length,
    bars: reviews.filter((r) => r.type === "bar" || r.type === "caffetteria").length,
    avgRating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
  };

  const handleAddReview = () => {
    toast.info("Funzionalità in arrivo!", {
      description: "Presto potrai aggiungere le tue recensioni.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Bentornato! 👋
          </h2>
          <p className="text-muted-foreground font-body">
            Ecco le tue ultime esperienze culinarie
          </p>
        </div>

        {/* Stats */}
        <StatsBar {...stats} />

        {/* Filters */}
        <FilterTabs activeFilter={filter} onFilterChange={setFilter} />

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                {...review}
                className={`animation-delay-${index * 100}`}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nessuna recensione trovata per questo filtro.
              </p>
            </div>
          )}
        </div>
      </main>

      <FloatingActionButton onClick={handleAddReview} />
    </div>
  );
};

export default Index;
