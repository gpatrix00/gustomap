import { useState, useRef, useEffect } from "react";
import { X, Star, Camera, MapPin, Utensils, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type PlaceType = "ristorante" | "bar" | "caffetteria";

interface ReviewFormData {
  name: string;
  type: PlaceType;
  rating: number;
  location: string;
  description: string;
  image: string | null;
}

interface EditingReview {
  id: string;
  name: string;
  type: PlaceType;
  rating: number;
  location: string;
  description: string;
  image: string;
}

interface AddReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReviewFormData) => void;
  editingReview?: EditingReview | null;
  onUpdate?: (id: string, data: ReviewFormData) => void;
}

const AddReviewForm = ({ open, onOpenChange, onSubmit, editingReview, onUpdate }: AddReviewFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    type: "ristorante",
    rating: 0,
    location: "",
    description: "",
    image: null,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({});

  const isEditing = !!editingReview;

  useEffect(() => {
    if (editingReview) {
      setFormData({
        name: editingReview.name,
        type: editingReview.type,
        rating: editingReview.rating,
        location: editingReview.location,
        description: editingReview.description,
        image: editingReview.image,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Immagine troppo grande (max 5MB)" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
        setErrors((prev) => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    }
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

    if (!formData.image) {
      newErrors.image = "Aggiungi una foto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditing && editingReview && onUpdate) {
        onUpdate(editingReview.id, formData);
      } else {
        onSubmit(formData);
      }
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "ristorante",
      rating: 0,
      location: "",
      description: "",
      image: null,
    });
    setErrors({});
    setHoverRating(0);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0">
        <SheetHeader className="px-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">
              {isEditing ? "Modifica Recensione" : "Nuova Recensione"}
            </SheetTitle>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%-80px)]">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Foto</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full h-48 rounded-lg border-2 border-dashed transition-all duration-200",
                  "flex flex-col items-center justify-center gap-2",
                  formData.image
                    ? "border-transparent overflow-hidden"
                    : "border-border hover:border-primary hover:bg-primary/5",
                  errors.image && "border-destructive"
                )}
              >
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Tocca per aggiungere una foto
                    </span>
                  </>
                )}
              </button>
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image}</p>
              )}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={cn(errors.name && "border-destructive")}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo di locale</Label>
              <div className="flex gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: option.value }))
                    }
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center gap-1",
                      formData.type === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <option.icon
                      className={cn(
                        "w-5 h-5",
                        formData.type === option.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        formData.type === option.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Valutazione</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, rating: star }))
                    }
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        (hoverRating || formData.rating) >= star
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      )}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-xs text-destructive">{errors.rating}</p>
              )}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className={cn("pl-10", errors.location && "border-destructive")}
                  maxLength={100}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className={cn(
                  "min-h-[120px] resize-none",
                  errors.description && "border-destructive"
                )}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {errors.description ? (
                  <p className="text-destructive">{errors.description}</p>
                ) : (
                  <span />
                )}
                <span>{formData.description.length}/500</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 border-t border-border bg-background">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
            >
              {isEditing ? "Salva Modifiche" : "Pubblica Recensione"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddReviewForm;
