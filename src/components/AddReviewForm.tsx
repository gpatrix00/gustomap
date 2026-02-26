import { useState, useEffect, useRef, useCallback } from "react";
import { X, Star, MapPin, Utensils, Coffee, Loader2, Navigation, Search, CalendarIcon, Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MultiImageUpload from "./MultiImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type PlaceType = "ristorante" | "bar" | "caffetteria";
type VisitStatus = "visited" | "wishlist";

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
  visitStatus: VisitStatus;
  visitDate?: Date;
  avgPricePerPerson?: number;
  city?: string;
  province?: string;
  region?: string;
  googlePhotoUrl?: string;
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
  visit_status?: string | null;
  visit_date?: string | null;
  avg_price_per_person?: number | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  google_photo_url?: string | null;
}

interface AddReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  editingReview?: EditingReview | null;
  onUpdate?: (id: string, data: ReviewFormData) => Promise<void>;
}

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: string;
  primaryType: string;
  city?: string;
  province?: string;
  region?: string;
  photoUrl?: string;
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
    visitStatus: "visited",
    visitDate: new Date(),
    avgPricePerPerson: undefined,
    city: undefined,
    province: undefined,
    region: undefined,
    googlePhotoUrl: undefined,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Place search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
        visitStatus: (editingReview.visit_status as VisitStatus) || "visited",
        visitDate: editingReview.visit_date ? new Date(editingReview.visit_date) : new Date(),
        avgPricePerPerson: editingReview.avg_price_per_person || undefined,
        city: editingReview.city || undefined,
        province: editingReview.province || undefined,
        region: editingReview.region || undefined,
        googlePhotoUrl: editingReview.google_photo_url || undefined,
      });
      setSearchQuery(editingReview.name);
    } else {
      resetForm();
      setSearchQuery("");
    }
  }, [editingReview, open]);

  // Debounced search
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places-search', {
        body: { query },
      });

      if (error) {
        console.error('Places search error:', error);
        setSearchResults([]);
      } else if (data?.success) {
        setSearchResults(data.results || []);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Places search error:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFormData((prev) => ({ ...prev, name: value }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 400);
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setFormData((prev) => ({
      ...prev,
      name: place.name,
      location: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      type: place.type as PlaceType,
      city: place.city,
      province: place.province,
      region: place.region,
      googlePhotoUrl: place.photoUrl,
    }));
    setSearchQuery(place.name);
    setShowResults(false);
    setSearchResults([]);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const newErrors: Partial<Record<string, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    } else if (formData.name.length > 100) {
      newErrors.name = "Il nome deve essere inferiore a 100 caratteri";
    }

    if (formData.visitStatus === "visited" && formData.rating === 0) {
      newErrors.rating = "Seleziona una valutazione";
    }

    if (!formData.location.trim()) {
      newErrors.location = "La posizione è obbligatoria";
    } else if (formData.location.length > 100) {
      newErrors.location = "La posizione deve essere inferiore a 100 caratteri";
    }

    if (formData.visitStatus === "visited" && !formData.description.trim()) {
      newErrors.description = "La descrizione è obbligatoria per i locali visitati";
    } else if (formData.description.length > 500) {
      newErrors.description = "La descrizione deve essere inferiore a 500 caratteri";
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
      visitStatus: "visited",
      visitDate: new Date(),
      avgPricePerPerson: undefined,
      city: undefined,
      province: undefined,
      region: undefined,
      googlePhotoUrl: undefined,
    });
    setErrors({});
    setHoverRating(0);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const hasCoordinates = formData.latitude !== undefined && formData.longitude !== undefined;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0 md:max-w-2xl md:mx-auto">
        <SheetHeader className="px-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">
              {isEditing ? "Modifica Recensione" : "Nuovo Locale"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%-80px)]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Visit Status Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Stato</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setFormData((prev) => ({ ...prev, visitStatus: "visited", visitDate: prev.visitDate || new Date() }))}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium",
                    formData.visitStatus === "visited"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  ✅ Ci sono stato
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setFormData((prev) => ({ ...prev, visitStatus: "wishlist" }))}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium",
                    formData.visitStatus === "wishlist"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  📌 Vorrei andarci
                </button>
              </div>
            </div>

            {/* Name with Place Search */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Cerca locale
              </Label>
              <div className="relative" ref={resultsRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  id="name"
                  placeholder="Cerca ristorante, bar, hotel..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  className={cn("pl-10 pr-10", errors.name && "border-destructive")}
                  maxLength={100}
                  disabled={submitting}
                  autoComplete="off"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((place) => (
                      <button
                        key={place.placeId}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                      >
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{place.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                          {place.primaryType && (
                            <span className="text-xs text-primary/70">{place.primaryType}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

            {/* Rating - only for visited */}
            {formData.visitStatus === "visited" && (
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
            )}

            {/* Visit Date - only for visited */}
            {formData.visitStatus === "visited" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data della visita</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.visitDate && "text-muted-foreground"
                      )}
                      disabled={submitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.visitDate ? format(formData.visitDate, "PPP", { locale: it }) : <span>Seleziona data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.visitDate}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, visitDate: date || undefined }))}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Avg Price Per Person - only for visited */}
            {formData.visitStatus === "visited" && (
              <div className="space-y-2">
                <Label htmlFor="avgPrice" className="text-sm font-medium">
                  Prezzo medio a persona (€)
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="avgPrice"
                    type="number"
                    placeholder="Es. 25"
                    value={formData.avgPricePerPerson ?? ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, avgPricePerPerson: e.target.value ? Number(e.target.value) : undefined }))}
                    className="pl-10"
                    min={0}
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

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
              {/* Show parsed address info */}
              {(formData.city || formData.province || formData.region) && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.city && (
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-full text-muted-foreground">{formData.city}</span>
                  )}
                  {formData.province && (
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-full text-muted-foreground">{formData.province}</span>
                  )}
                  {formData.region && (
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-full text-muted-foreground">{formData.region}</span>
                  )}
                </div>
              )}
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

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Foto {formData.googlePhotoUrl && <span className="text-muted-foreground font-normal">(foto di default da Google)</span>}
              </Label>
              <MultiImageUpload
                images={formData.images}
                onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                
                error={errors.images}
                disabled={submitting}
              />
            </div>

            {/* Description - required only for visited */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                La tua esperienza {formData.visitStatus === "wishlist" && <span className="text-muted-foreground font-normal">(opzionale)</span>}
              </Label>
              <Textarea
                id="description"
                placeholder={formData.visitStatus === "visited" ? "Racconta la tua esperienza..." : "Perché vorresti andarci? (opzionale)"}
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
                "Salva"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddReviewForm;
