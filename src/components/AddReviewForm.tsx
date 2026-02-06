import { useState, useEffect } from "react";
import { X, Star, MapPin, Utensils, Coffee, Loader2, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MultiImageUpload from "./MultiImageUpload";

type PlaceType = "ristorante" | "bar" | "caffetteria";

const CUISINE_TYPES = [
  { value: "italiana", label: "Italiana" },
  { value: "giapponese", label: "Giapponese" },
  { value: "cinese", label: "Cinese" },
  { value: "messicana", label: "Messicana" },
  { value: "indiana", label: "Indiana" },
  { value: "thailandese", label: "Thailandese" },
  { value: "americana", label: "Americana" },
  { value: "francese", label: "Francese" },
  { value: "greca", label: "Greca" },
  { value: "spagnola", label: "Spagnola" },
  { value: "mediterranea", label: "Mediterranea" },
  { value: "pizza", label: "Pizzeria" },
  { value: "sushi", label: "Sushi" },
  { value: "steakhouse", label: "Steakhouse" },
  { value: "pesce", label: "Pesce" },
  { value: "vegetariana", label: "Vegetariana" },
  { value: "altro", label: "Altro" },
] as const;

interface ReviewFormData {
  name: string;
  type: PlaceType;
  rating: number;
  location: string;
  description: string;
  images: (File | string)[];
  latitude?: number;
  longitude?: number;
  cuisineType?: string;
}

interface EditingReview {
  id: string;
  name: string;
  type: PlaceType;
  rating: number;
  location: string;
  description: string;
  image_urls: string[];
  latitude?: number | null;
  longitude?: number | null;
  cuisine_type?: string | null;
}

interface AddReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  editingReview?: EditingReview | null;
  onUpdate?: (id: string, data: ReviewFormData) => Promise<void>;
}

const AddReviewForm = ({ open, onOpenChange, onSubmit, editingReview, onUpdate }: AddReviewFormProps): React.JSX.Element => {
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    type: "ristorante",
    rating: 0,
    location: "",
    description: "",
    images: [],
    latitude: undefined,
    longitude: undefined,
    cuisineType: undefined,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const isEditing = !!editingReview;

  useEffect(() => {
    if (editingReview) {
      setFormData({
        name: editingReview.name,
        type: editingReview.type,
        rating: editingReview.rating,
        location: editingReview.location,
        description: editingReview.description,
        images: editingReview.image_urls || [],
        latitude: editingReview.latitude || undefined,
        longitude: editingReview.longitude || undefined,
        cuisineType: editingReview.cuisine_type || undefined,
      });
    } else {
      resetForm();
    }
  }, [editingReview, open]);

  const typeOptions: { value: PlaceType; label: string; icon: typeof Utensils }[] = [
    { value: "ristorante", label: "Ristorante", icon: Utensils },
    { value: "bar", label: "Bar", icon: Coffee },
    { value: "caffetteria", label: "Caffetteria", icon: Coffee },
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, latitude: "Geolocalizzazione non supportata" }));
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setErrors((prev) => ({ ...prev, latitude: "Impossibile ottenere la posizione" }));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReviewFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    } else if (formData.name.length > 100) {
      newErrors.name = "Il nome deve essere inferiore a 100 caratteri";
    }

    if (formData.rating === 0) {
      newErrors.rating = "Seleziona una valutazione";
    }

    if (!formData.location.trim()) {
      newErrors.location = "La posizione è obbligatoria";
    } else if (formData.location.length > 100) {
      newErrors.location = "La posizione deve essere inferiore a 100 caratteri";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descrizione è obbligatoria";
    } else if (formData.description.length > 500) {
      newErrors.description = "La descrizione deve essere inferiore a 500 caratteri";
    }

    if (formData.images.length === 0 && !isEditing) {
      newErrors.images = "Aggiungi almeno una foto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isEditing && editingReview && onUpdate) {
        await onUpdate(editingReview.id, formData);
      } else {
        await onSubmit(formData);
      }
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "ristorante",
      rating: 0,
      location: "",
      description: "",
      images: [],
      latitude: undefined,
      longitude: undefined,
      cuisineType: undefined,
    });
    setErrors({});
    setHoverRating(0);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const hasCoordinates = formData.latitude !== undefined && formData.longitude !== undefined;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0">
        <SheetHeader className="px-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">
              {isEditing ? "Modifica Recensione" : "Nuova Recensione"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%-80px)]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Foto</Label>
              <MultiImageUpload
                images={formData.images}
                onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                maxImages={5}
                error={errors.images}
                disabled={submitting}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome del locale
              </Label>
              <Input
                id="name"
                placeholder="Es. Trattoria del Borgo"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={cn(errors.name && "border-destructive")}
                maxLength={100}
                disabled={submitting}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo di locale</Label>
              <div className="flex gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={submitting}
                    onClick={() => setFormData((prev) => ({ ...prev, type: option.value }))}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center gap-1",
                      formData.type === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground",
                    )}
                  >
                    <option.icon
                      className={cn(
                        "w-5 h-5",
                        formData.type === option.value ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        formData.type === option.value ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Type - Only for restaurants */}
            {formData.type === "ristorante" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo di cucina</Label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_TYPES.map((cuisine) => (
                    <button
                      key={cuisine.value}
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          cuisineType: prev.cuisineType === cuisine.value ? undefined : cuisine.value,
                        }))
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                        formData.cuisineType === cuisine.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground",
                      )}
                    >
                      {cuisine.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Valutazione</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={submitting}
                    onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        (hoverRating || formData.rating) >= star
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted",
                      )}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Posizione
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Es. Milano Centro"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className={cn("pl-10", errors.location && "border-destructive")}
                  maxLength={100}
                  disabled={submitting}
                />
              </div>
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            {/* GPS Coordinates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Coordinate GPS <span className="text-muted-foreground font-normal">(per la mappa)</span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={submitting || gettingLocation}
                  className="flex-1 gap-2"
                >
                  {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  {hasCoordinates ? "Aggiorna posizione" : "Usa posizione attuale"}
                </Button>
              </div>
              {hasCoordinates && (
                <p className="text-xs text-muted-foreground">
                  📍 {formData.latitude?.toFixed(5)}, {formData.longitude?.toFixed(5)}
                </p>
              )}
              {errors.latitude && <p className="text-xs text-destructive">{errors.latitude}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                La tua esperienza
              </Label>
              <Textarea
                id="description"
                placeholder="Racconta la tua esperienza..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className={cn("min-h-[120px] resize-none", errors.description && "border-destructive")}
                maxLength={500}
                disabled={submitting}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {errors.description ? <p className="text-destructive">{errors.description}</p> : <span />}
                <span>{formData.description.length}/500</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 border-t border-border bg-background">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isEditing ? (
                "Salva Modifiche"
              ) : (
                "Pubblica Recensione"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddReviewForm;
