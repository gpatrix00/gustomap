import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";

import type { Json } from "@/integrations/supabase/types";

interface PublicReviewData {
  id: string;
  name: string;
  type: string;
  rating: number;
  location: string;
  description: string;
  image_urls: Json | null;
  image_url: string | null;
  created_at: string;
}

const PublicReview = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<PublicReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) {
        setError("Recensione non trovata");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("reviews")
          .select("id, name, type, rating, location, description, image_urls, image_url, created_at")
          .eq("id", id)
          .eq("is_public", true)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Questa recensione non esiste o non è pubblica");
        } else {
          setReview(data);
        }
      } catch (err) {
        console.error("Error fetching review:", err);
        setError("Errore nel caricamento della recensione");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const getImages = (): string[] => {
    if (!review) return [];
    if (review.image_urls && Array.isArray(review.image_urls)) {
      return review.image_urls as string[];
    }
    if (review.image_url) {
      return [review.image_url];
    }
    return [];
  };

  const typeLabels: Record<string, string> = {
    ristorante: "Ristorante",
    bar: "Bar",
    caffetteria: "Caffetteria",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {error || "Recensione non trovata"}
          </h1>
          <p className="text-muted-foreground">
            La recensione potrebbe essere stata rimossa o resa privata.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Torna alla home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = getImages();
  const formattedDate = new Date(review.created_at).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-[45vh] min-h-[300px]">
        <ImageGallery images={images} className="h-full" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        
        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-soft z-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>

        {/* Type Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 bg-background/80 backdrop-blur-sm text-sm font-medium rounded-full text-foreground">
            {typeLabels[review.type] || review.type}
          </span>
        </div>

        {/* Photo Count */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="px-2 py-1 bg-background/80 backdrop-blur-sm text-xs font-medium rounded-full text-foreground">
              {images.length} foto
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container max-w-lg mx-auto px-6 py-6 -mt-8 relative space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-semibold text-foreground leading-tight">
            {review.name}
          </h1>
          
          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-display font-semibold text-foreground">
              {review.rating}.0
            </span>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 py-4 border-y border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{review.location}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-medium text-foreground">
            La recensione
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed">
            {review.description}
          </p>
        </div>

        {/* Branding */}
        <div className="pt-8 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            Condiviso tramite{" "}
            <Link to="/" className="text-primary hover:underline font-medium">
              Gusto
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicReview;
