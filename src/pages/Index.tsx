import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import FilterTabs from "@/components/FilterTabs";
import ReviewCard from "@/components/ReviewCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import AddReviewForm from "@/components/AddReviewForm";
import ReviewDetail from "@/components/ReviewDetail";
import AuthForm from "@/components/AuthForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Review } from "@/services/reviewsService";

type FilterType = "tutti" | "ristoranti" | "bar";
type PlaceType = "ristorante" | "bar" | "caffetteria";

const Index = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { reviews, loading: reviewsLoading, addReview, updateReview, deleteReview, fetchReviews } = useReviews();
  
  const [filter, setFilter] = useState<FilterType>("tutti");
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

  const uploadImage = async (image: File | string | null): Promise<string | null> => {
    if (!image || typeof image === "string") {
      return typeof image === "string" ? image : null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    const fileExt = image.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("review-images")
      .upload(fileName, image);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("review-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleAddReview = async (data: {
    name: string;
    type: PlaceType;
    rating: number;
    location: string;
    description: string;
    image: File | string | null;
  }) => {
    try {
      const imageUrl = await uploadImage(data.image);
      
      await addReview({
        name: data.name,
        type: data.type,
        rating: data.rating,
        location: data.location,
        description: data.description,
        image_url: imageUrl,
      });

      toast.success("Recensione pubblicata!", {
        description: `La tua recensione di ${data.name} è stata aggiunta.`,
      });
    } catch (error: any) {
      console.error("Error adding review:", error);
      toast.error("Errore", {
        description: error.message || "Impossibile pubblicare la recensione",
      });
      throw error;
    }
  };

  const handleUpdateReview = async (id: string, data: {
    name: string;
    type: PlaceType;
    rating: number;
    location: string;
    description: string;
    image: File | string | null;
  }) => {
    try {
      let imageUrl = data.image;
      if (data.image instanceof File) {
        imageUrl = await uploadImage(data.image);
      }

      await updateReview(id, {
        name: data.name,
        type: data.type,
        rating: data.rating,
        location: data.location,
        description: data.description,
        image_url: typeof imageUrl === "string" ? imageUrl : null,
      });

      setEditingReview(null);
      toast.success("Recensione aggiornata!", {
        description: `Le modifiche a "${data.name}" sono state salvate.`,
      });
    } catch (error: any) {
      console.error("Error updating review:", error);
      toast.error("Errore", {
        description: error.message || "Impossibile aggiornare la recensione",
      });
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const reviewName = reviews.find((r) => r.id === reviewId)?.name;
      await deleteReview(reviewId);
      toast.success("Recensione eliminata", {
        description: `"${reviewName}" è stata rimossa.`,
      });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error("Errore", {
        description: error.message || "Impossibile eliminare la recensione",
      });
    }
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

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm onSuccess={fetchReviews} />;
  }

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
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                name={review.name}
                type={review.type as PlaceType}
                rating={review.rating}
                date={new Date(review.created_at).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })}
                location={review.location}
                image={review.image_url || "/placeholder.svg"}
                description={review.description}
                onClick={() => handleReviewClick(review)}
                className={`animation-delay-${index * 100}`}
              />
            ))
          ) : (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">
                {filter === "tutti" 
                  ? "Non hai ancora aggiunto recensioni."
                  : "Nessuna recensione trovata per questo filtro."}
              </p>
              {filter === "tutti" && (
                <p className="text-sm text-muted-foreground">
                  Tocca il bottone + per aggiungere la tua prima recensione!
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsFormOpen(true)} />
      
      <AddReviewForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAddReview}
        editingReview={editingReview ? {
          id: editingReview.id,
          name: editingReview.name,
          type: editingReview.type as PlaceType,
          rating: editingReview.rating,
          location: editingReview.location,
          description: editingReview.description,
          image_url: editingReview.image_url,
        } : null}
        onUpdate={handleUpdateReview}
      />

      <ReviewDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        review={selectedReview ? {
          id: selectedReview.id,
          name: selectedReview.name,
          type: selectedReview.type as PlaceType,
          rating: selectedReview.rating,
          date: new Date(selectedReview.created_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          location: selectedReview.location,
          image: selectedReview.image_url || "/placeholder.svg",
          description: selectedReview.description,
        } : null}
        onEdit={() => selectedReview && handleEditReview(selectedReview)}
        onDelete={() => selectedReview && handleDeleteReview(selectedReview.id)}
      />
    </div>
  );
};

export default Index;
