import { Star, MapPin, Clock, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ImageGallery from "./ImageGallery";
import ShareButton from "./ShareButton";

interface Review {
  id: string;
  name: string;
  type: "ristorante" | "bar" | "caffetteria";
  rating: number;
  date: string;
  location: string;
  images: string[];
  description: string;
  isPublic: boolean;
}

interface ReviewDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublic: (reviewId: string, isPublic: boolean) => Promise<void>;
}

const ReviewDetail = ({ open, onOpenChange, review, onEdit, onDelete, onTogglePublic }: ReviewDetailProps) => {
  if (!review) return null;

  const typeLabels = {
    ristorante: "Ristorante",
    bar: "Bar",
    caffetteria: "Caffetteria",
  };

  const handleEdit = () => {
    onOpenChange(false);
    onEdit();
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-full p-0 border-0 rounded-none"
      >
        <div className="h-full flex flex-col bg-background">
          {/* Hero Image Gallery */}
          <div className="relative h-[45vh] min-h-[300px]">
            <ImageGallery images={review.images} className="h-full" />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
            
            {/* Back Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-soft z-10"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>

            {/* Type Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1.5 bg-background/80 backdrop-blur-sm text-sm font-medium rounded-full text-foreground">
                {typeLabels[review.type]}
              </span>
            </div>

            {/* Photo Count */}
            {review.images.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="px-2 py-1 bg-background/80 backdrop-blur-sm text-xs font-medium rounded-full text-foreground">
                  {review.images.length} foto
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 -mt-8 relative space-y-6 overflow-y-auto">
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{review.date}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="font-display text-lg font-medium text-foreground">
                La mia esperienza
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                {review.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <ShareButton
                reviewId={review.id}
                reviewName={review.name}
                isPublic={review.isPublic}
                onTogglePublic={(isPublic) => onTogglePublic(review.id, isPublic)}
              />
              <Button
                onClick={handleEdit}
                variant="outline"
                className="flex-1 h-12 gap-2"
              >
                <Pencil className="w-4 h-4" />
                Modifica
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90%] rounded-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Eliminare questa recensione?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione non può essere annullata. La recensione di "{review.name}" verrà eliminata definitivamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReviewDetail;
