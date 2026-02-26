import { useState, useRef } from "react";
import { X, Plus, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
  images: (File | string)[];
  onChange: (images: (File | string)[]) => void;
  error?: string;
  disabled?: boolean;
}

const MultiImageUpload = ({
  images,
  onChange,
  error,
  disabled,
}: MultiImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate previews for files
  const getPreviewUrl = (image: File | string): string => {
    if (typeof image === "string") return image;
    return URL.createObjectURL(image);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip files > 5MB
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles]);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = true;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        multiple
        disabled={disabled}
      />

      {images.length === 0 ? (
        // Empty state - big upload area
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "w-full h-48 rounded-lg border-2 border-dashed transition-all duration-200",
            "flex flex-col items-center justify-center gap-2",
            "border-border hover:border-primary hover:bg-primary/5",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Camera className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Tocca per aggiungere foto
          </span>
          <span className="text-xs text-muted-foreground">
            5MB ciascuna
          </span>
        </button>
      ) : (
        // Grid of images with add button
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={getPreviewUrl(image)}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded font-medium">
                  Copertina
                </span>
              )}
            </div>
          ))}
          
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "aspect-square rounded-lg border-2 border-dashed border-border",
                "flex flex-col items-center justify-center gap-1",
                "hover:border-primary hover:bg-primary/5 transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                +
              </span>
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default MultiImageUpload;
