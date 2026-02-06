import { useState, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileForm = ({ open, onOpenChange }: ProfileFormProps) => {
  const { profile, updateProfile, uploadAvatar, deleteAvatar, refetch } = useProfile();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when profile changes
  useState(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'immagine deve essere inferiore a 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAvatarDeleted(false);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarDeleted(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarDeleted) {
        await deleteAvatar();
        avatarUrl = undefined;
      } else if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      if (!avatarDeleted) {
        await updateProfile({
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          avatar_url: avatarUrl || undefined,
        });
      }

      await refetch();
      setAvatarDeleted(false);
      toast.success("Profilo aggiornato!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || undefined;
  };

  const currentAvatar = avatarDeleted ? null : (avatarPreview || profile?.avatar_url);
  const showDeleteButton = !avatarDeleted && (avatarPreview || profile?.avatar_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Modifica profilo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentAvatar || undefined} alt="Avatar" />
                <AvatarFallback className="bg-secondary text-lg">
                  {getInitials() || <User className="w-8 h-8 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              className="hidden"
            />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Clicca per cambiare la foto
              </p>
              {showDeleteButton && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Rimuovi
                </button>
              )}
            </div>
          </div>

          {/* Name fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Il tuo nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Cognome</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Il tuo cognome"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileForm;
