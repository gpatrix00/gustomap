import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Review = Tables<"reviews">;
export type ReviewInsert = TablesInsert<"reviews">;
export type ReviewUpdate = TablesUpdate<"reviews">;

export const reviewsService = {
  async getAll(): Promise<Review[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(review: Omit<ReviewInsert, "user_id">): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        ...review,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, review: ReviewUpdate): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .update(review)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  async uploadImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("review-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("review-images")
      .getPublicUrl(fileName);

    return publicUrl;
  },
};
