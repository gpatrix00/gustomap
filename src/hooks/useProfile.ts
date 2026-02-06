import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // Profile might not exist yet for existing users
        if (error.code === "PGRST116") {
          // Create profile for existing user
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({ user_id: user.id })
            .select()
            .single();

          if (!insertError && newProfile) {
            setProfile(newProfile as Profile);
          }
        } else {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  }) => {
    if (!user) throw new Error("Utente non autenticato");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data as Profile);
    return data;
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("Utente non autenticato");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Delete old avatar if exists
    await supabase.storage.from("avatars").remove([fileName]);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // Add cache buster
    return `${publicUrl}?t=${Date.now()}`;
  };

  const deleteAvatar = async () => {
    if (!user) throw new Error("Utente non autenticato");

    // List and delete all files in the user's avatar folder
    const { data: files } = await supabase.storage
      .from("avatars")
      .list(user.id);

    if (files && files.length > 0) {
      const filesToDelete = files.map((file) => `${user.id}/${file.name}`);
      await supabase.storage.from("avatars").remove(filesToDelete);
    }

    // Update profile to remove avatar_url
    await updateProfile({ avatar_url: undefined });
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch: fetchProfile,
  };
};
