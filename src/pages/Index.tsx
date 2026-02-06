import { useState } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import FilterTabs from "@/components/FilterTabs";
import ReviewCard from "@/components/ReviewCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import AddReviewForm from "@/components/AddReviewForm";
import ReviewDetail from "@/components/ReviewDetail";
import { toast } from "sonner";

import restaurant1 from "@/assets/restaurant-1.jpg";
import bar1 from "@/assets/bar-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";

type FilterType = "tutti" | "ristoranti" | "bar";
type PlaceType = "ristorante" | "bar" | "caffetteria";

interface Review {
  id: string;
  name: string;
  type: PlaceType;
  rating: number;
  date: string;
  location: string;
  image: string;
  description: string;
}

const initialReviews: Review[] = [
  {
    id: "1",
    name: "Trattoria del Borgo",
    type: "ristorante",
    rating: 5,
    date: "2 giorni fa",
    location: "Milano Centro",
    image: restaurant1,
    description: "Esperienza incredibile. La pasta fatta in casa era semplicemente divina, servizio impeccabile. L'atmosfera era accogliente e intima, perfetta per una cena romantica. Il personale era attento e professionale, consigliando i piatti migliori del menu. Tornerò sicuramente!",
  },
  {
    id: "2",
    name: "Caffè Florian",
    type: "caffetteria",
    rating: 4,
    date: "1 settimana fa",
    location: "Venezia",
    image: bar1,
    description: "Atmosfera magica, caffè ottimo. Prezzi un po' alti ma ne vale la pena per l'esperienza. Seduti in Piazza San Marco, con vista sul campanile, ogni sorso di caffè diventa un momento speciale.",
  },
  {
    id: "3",
    name: "Osteria Francescana",
    type: "ristorante",
    rating: 5,
    date: "2 settimane fa",
    location: "Modena",
    image: restaurant2,
    description: "Una delle migliori esperienze culinarie della mia vita. Ogni piatto un capolavoro di creatività e gusto. Chef Bottura è un genio assoluto che riesce a trasformare ingredienti semplici in opere d'arte commestibili.",
  },
];

const Index = () => {
  const [filter, setFilter] = useState<FilterType>("tutti");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

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
    avgRating: reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0,
  };

  const handleAddReview = (data: {
    name: string;
    type: PlaceType;
    rating: number;
    location: string;
    description: string;
    image: string | null;
  }) => {
    const newReview: Review = {
      id: Date.now().toString(),
      name: data.name,
      type: data.type,
      rating: data.rating,
      date: "Adesso",
      location: data.location,
      description: data.description,
      image: data.image || "",
    };

    setReviews((prev) => [newReview, ...prev]);
    toast.success("Recensione pubblicata!", {
      description: `La tua recensione di ${data.name} è stata aggiunta.`,
    });
  };

  const handleUpdateReview = (id: string, data: {
    name: string;
    type: PlaceType;
    rating: number;
    location: string;
    description: string;
    image: string | null;
  }) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              name: data.name,
              type: data.type,
              rating: data.rating,
              location: data.location,
              description: data.description,
              image: data.image || review.image,
            }
          : review
      )
    );
    setEditingReview(null);
    toast.success("Recensione aggiornata!", {
      description: `Le modifiche a "${data.name}" sono state salvate.`,
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    const reviewName = reviews.find((r) => r.id === reviewId)?.name;
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    toast.success("Recensione eliminata", {
      description: `"${reviewName}" è stata rimossa.`,
    });
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setIsDetailOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingReview(null);
    }
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
                onClick={() => handleReviewClick(review)}
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

      <FloatingActionButton onClick={() => setIsFormOpen(true)} />
      
      <AddReviewForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAddReview}
        editingReview={editingReview}
        onUpdate={handleUpdateReview}
      />

      <ReviewDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        review={selectedReview}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
      />
    </div>
  );
};

export default Index;
