import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewResponseDTO } from "@/types/api";

interface ReviewFormProps {
  bookId: string;
  bookTitle: string;
  onSubmit: (data: { rating: number; content: string }) => void;
  onCancel: () => void;
  initialData?: ReviewResponseDTO;
  isLoading?: boolean;
}

export function ReviewForm({
  bookId,
  bookTitle,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [content, setContent] = useState(initialData?.content || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSubmit({ rating, content });
  };

  const isEditing = !!initialData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? "Edit Review" : "Write a Review"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{bookTitle}</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <RatingStars
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Review</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this book..."
              className="min-h-[120px]"
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={rating === 0 || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? "Saving..." : isEditing ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}