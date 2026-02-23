import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileForm from "@/components/ProfileForm";

const Header = () => {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getInitials = () => {
    const first = profile?.first_name?.charAt(0) || "";
    const last = profile?.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || undefined;
  };

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="GustoMap" className="w-10 h-10 rounded-full object-cover scale-[1.35]" />
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                GustoMap
              </h1>
              <p className="text-xs text-muted-foreground font-body">
                Le tue esperienze
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                  <AvatarFallback className="bg-secondary">
                    {getInitials() || <User className="w-5 h-5 text-muted-foreground" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium truncate">{displayName}</p>
                {profile?.first_name && (
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Modifica profilo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileForm open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
};

export default Header;
