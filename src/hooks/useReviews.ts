import { useState, useEffect, useCallback } from "react";
import { reviewsService, Review } from "@/services/reviewsService";
import { useAuth } from "./useAuth";

export const useReviews = () => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!isAuthenticated) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await reviewsService.getAll();
      setReviews(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = async (review: Omit<Review, "id" | "user_id" | "created_at" | "updated_at">) => {
    const newReview = await reviewsService.create(review);
    setReviews((prev) => [newReview, ...prev]);
    return newReview;
  };

  const updateReview = async (id: string, review: Partial<Review>) => {
    const updatedReview = await reviewsService.update(id, review);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? updatedReview : r))
    );
    return updatedReview;
  };

  const deleteReview = async (id: string) => {
    await reviewsService.delete(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
  };
};
