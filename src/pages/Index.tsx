import { useState, useMemo } from "react";
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
import SearchBar from "@/components/SearchBar";
import MapView from "@/components/MapView";
import ViewToggle from "@/components/ViewToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Review } from "@/services/reviewsService";

type FilterType = "tutti" | "ristoranti" | "bar";
type VisitFilter = "tutti" | "visited" | "wishlist";
type PlaceType = "ristorante" | "bar" | "caffetteria";
type ViewMode = "list" | "map";

const Index = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { reviews, loading: reviewsLoading, addReview, updateReview, deleteReview, fetchReviews } = useReviews();
  
  const [filter, setFilter] = useState<FilterType>("tutti");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("tutti");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const typeMatch = 
        filter === "tutti" ? true :
        filter === "ristoranti" ? review.type === "ristorante" :
        filter === "bar" ? (review.type === "bar" || review.type === "caffetteria") :
        true;

      const visitMatch =
        visitFilter === "tutti" ? true :
        review.visit_status === visitFilter;

      const query = searchQuery.toLowerCase().trim();
      const searchMatch = !query || 
        review.name.toLowerCase().includes(query) ||
        review.location.toLowerCase().includes(query) ||
        review.description.toLowerCase().includes(query) ||
        (review.city && review.city.toLowerCase().includes(query)) ||
        (review.province && review.province.toLowerCase().includes(query)) ||
        (review.region && review.region.toLowerCase().includes(query));

      return typeMatch && visitMatch && searchMatch;
    });
  }, [reviews, filter, visitFilter, searchQuery]);

  const visitedReviews = reviews.filter((r) => r.visit_status !== "wishlist");
  const stats = {
    totalReviews: visitedReviews.length,
    restaurants: reviews.filter((r) => r.type === "ristorante").length,
    bars: reviews.filter((r) => r.type === "bar" || r.type === "caffetteria").length,
    avgRating: visitedReviews.length > 0 ? visitedReviews.reduce((acc, r) => acc + r.rating, 0) / visitedReviews.length : 0,
  };

  const uploadImages = async (images: (File | string)[]): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    const uploadedUrls: string[] = [];

    for (const image of images) {
      if (typeof image === "string") {
        uploadedUrls.push(image);
      } else {
        const fileExt = image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("review-images")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        // Store the path, not a public URL
        uploadedUrls.push(fileName);
      }
    }

    return uploadedUrls;
  };

  const getImageUrls = (review: Review): string[] => {
    if (review.image_urls && Array.isArray(review.image_urls)) {
      return review.image_urls as string[];
    }
    if (review.image_url) {
      return [review.image_url];
    }
    // Fallback to google photo
    if (review.google_photo_url) {
      return [review.google_photo_url];
    }
    return [];
  };

  const handleAddReview = async (data: {
    name: string;
    type: PlaceType;
    rating: number;
    location: string;
    description: string;
    images: (File | string)[];
    latitude?: number;
    longitude?: number;
    cuisineType?: string;
    visitStatus: string;
    visitDate?: Date;
    avgPricePerPerson?: number;
    city?: string;
    province?: string;
    region?: string;
    googlePhotoUrl?: string;
  }) => {
    try {
      const imageUrls = data.images.length > 0 ? await uploadImages(data.images) : [];
      
      await addReview({
        name: data.name,
        type: data.type,
        rating: data.visitStatus === "visited" ? data.rating : 0,
        location: data.location,
        description: data.description || "",
        image_url: imageUrls[0] || data.googlePhotoUrl || null,
        image_urls: imageUrls.length > 0 ? imageUrls : (data.googlePhotoUrl ? [data.googlePhotoUrl] : []),
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        is_public: false,
        cuisine_type: data.cuisineType || null,
        visit_status: data.visitStatus,
        visit_date: data.visitDate ? `${data.visitDate.getFullYear()}-${String(data.visitDate.getMonth() + 1).padStart(2, '0')}-${String(data.visitDate.getDate()).padStart(2, '0')}` : null,
        avg_price_per_person: data.avgPricePerPerson || null,
        city: data.city || null,
        province: data.province || null,
        region: data.region || null,
        google_photo_url: data.googlePhotoUrl || null,
      });

      toast.success(data.visitStatus === "wishlist" ? "Locale aggiunto alla lista!" : "Recensione pubblicata!", {
        description: `${data.name} è stato aggiunto.`,
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
    images: (File | string)[];
    latitude?: number;
    longitude?: number;
    cuisineType?: string;
    visitStatus: string;
    visitDate?: Date;
    avgPricePerPerson?: number;
    city?: string;
    province?: string;
    region?: string;
    googlePhotoUrl?: string;
  }) => {
    try {
      const imageUrls = data.images.length > 0 ? await uploadImages(data.images) : [];

      await updateReview(id, {
        name: data.name,
        type: data.type,
        rating: data.visitStatus === "visited" ? data.rating : 0,
        location: data.location,
        description: data.description || "",
        image_url: imageUrls[0] || data.googlePhotoUrl || null,
        image_urls: imageUrls.length > 0 ? imageUrls : (data.googlePhotoUrl ? [data.googlePhotoUrl] : []),
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        cuisine_type: data.cuisineType || null,
        visit_status: data.visitStatus,
        visit_date: data.visitDate ? `${data.visitDate.getFullYear()}-${String(data.visitDate.getMonth() + 1).padStart(2, '0')}-${String(data.visitDate.getDate()).padStart(2, '0')}` : null,
        avg_price_per_person: data.avgPricePerPerson || null,
        city: data.city || null,
        province: data.province || null,
        region: data.region || null,
        google_photo_url: data.googlePhotoUrl || null,
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

  const handleTogglePublic = async (reviewId: string, isPublic: boolean) => {
    try {
      await updateReview(reviewId, { is_public: isPublic });
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, is_public: isPublic });
      }
    } catch (error: any) {
      console.error("Error toggling public:", error);
      throw error;
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={fetchReviews} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Bentornato! 👋
          </h2>
          <p className="text-muted-foreground font-body">
            Ecco le tue ultime esperienze culinarie
          </p>
        </div>

        <ViewToggle mode={viewMode} onChange={setViewMode} />

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cerca per nome, città, provincia..."
        />

        <StatsBar {...stats} />

        <FilterTabs
          activeFilter={filter}
          onFilterChange={setFilter}
          visitFilter={visitFilter}
          onVisitFilterChange={setVisitFilter}
        />

        {viewMode === "map" ? (
          <MapView
            reviews={filteredReviews.map((review) => ({
              id: review.id,
              name: review.name,
              type: review.type,
              rating: review.rating,
              location: review.location,
              latitude: review.latitude || 0,
              longitude: review.longitude || 0,
              image: getImageUrls(review)[0],
            }))}
            onReviewClick={(id) => {
              const review = reviews.find((r) => r.id === id);
              if (review) {
                setViewMode("list");
                handleReviewClick(review);
              }
            }}
            className="h-[60vh] min-h-[400px] lg:h-[70vh]"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewsLoading ? (
              <div className="flex justify-center py-12 col-span-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  name={review.name}
                  type={review.type as PlaceType}
                  rating={review.rating}
                  date={review.visit_date
                    ? new Date(review.visit_date + "T00:00:00").toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                      })
                    : new Date(review.created_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                      })
                  }
                  location={review.location}
                  images={getImageUrls(review)}
                  description={review.description}
                  cuisineType={review.cuisine_type}
                  visitStatus={review.visit_status}
                  avgPricePerPerson={review.avg_price_per_person}
                  onClick={() => handleReviewClick(review)}
                  className={`animation-delay-${index * 100}`}
                />
              ))
            ) : (
              <div className="text-center py-12 space-y-2 col-span-full">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Nessun risultato per "${searchQuery}"`
                    : filter === "tutti" 
                      ? "Non hai ancora aggiunto recensioni."
                      : "Nessuna recensione trovata per questo filtro."}
                </p>
                {!searchQuery && filter === "tutti" && (
                  <p className="text-sm text-muted-foreground">
                    Tocca il bottone + per aggiungere la tua prima recensione!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
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
          image_urls: getImageUrls(editingReview),
          latitude: editingReview.latitude,
          longitude: editingReview.longitude,
          cuisine_type: editingReview.cuisine_type,
          visit_status: editingReview.visit_status,
          visit_date: editingReview.visit_date,
          avg_price_per_person: editingReview.avg_price_per_person,
          city: editingReview.city,
          province: editingReview.province,
          region: editingReview.region,
          google_photo_url: editingReview.google_photo_url,
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
          images: getImageUrls(selectedReview),
          description: selectedReview.description,
          isPublic: selectedReview.is_public,
          cuisineType: selectedReview.cuisine_type,
          visitStatus: selectedReview.visit_status,
          visitDate: selectedReview.visit_date,
          avgPricePerPerson: selectedReview.avg_price_per_person,
          city: selectedReview.city,
          province: selectedReview.province,
          region: selectedReview.region,
        } : null}
        onEdit={() => selectedReview && handleEditReview(selectedReview)}
        onDelete={() => selectedReview && handleDeleteReview(selectedReview.id)}
        onTogglePublic={handleTogglePublic}
      />
    </div>
  );
};

export default Index;
