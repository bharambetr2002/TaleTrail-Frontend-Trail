import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Calendar, User, Building, Star, Heart, MessageSquare } from "lucide-react";
import { BookResponseDTO, ReviewResponseDTO, UserBookResponseDTO, READING_STATUS_LABELS } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ProgressTracker } from "@/components/layout/ProgressTracker";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [book, setBook] = useState<BookResponseDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [userBook, setUserBook] = useState<UserBookResponseDTO | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookDetail();
    }
  }, [id]);

  const loadBookDetail = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Load book details
      const bookResponse = await api.getBook(id);
      if (bookResponse.success) {
        setBook(bookResponse.data);
      }

      // Load reviews
      const reviewsResponse = await api.getBookReviews(id);
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data);
      }

      // Load user's book status if authenticated
      if (isAuthenticated) {
        try {
          const myBooksResponse = await api.getMyBooks();
          if (myBooksResponse.success) {
            const userBookData = myBooksResponse.data.find((b: UserBookResponseDTO) => b.bookId === id);
            setUserBook(userBookData || null);
          }
        } catch (error) {
          // User hasn't added this book yet
        }
      }
    } catch (error) {
      toast({
        title: "Error loading book",
        description: "Failed to load book details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLibrary = async (status: number) => {
    if (!id || !isAuthenticated) return;
    
    try {
      const response = await api.addBookToLibrary({
        bookId: id,
        readingStatus: status,
        progress: 0
      });

      if (response.success) {
        setUserBook(response.data as any);
        toast({
          title: "Book added",
          description: `Added to your library as "${READING_STATUS_LABELS[status]}"`
        });
      }
    } catch (error) {
      toast({
        title: "Failed to add book",
        description: "Could not add book to your library",
        variant: "destructive"
      });
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    if (!id || !userBook) return;

    try {
      const response = await api.updateBookStatus(id, {
        readingStatus: userBook.readingStatus,
        progress
      });

      if (response.success) {
        setUserBook(prev => prev ? { ...prev, progress } : null);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update reading progress",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (status: number) => {
    if (!id || !userBook) return;

    try {
      const response = await api.updateBookStatus(id, {
        readingStatus: status,
        progress: userBook.progress
      });

      if (response.success) {
        setUserBook(prev => prev ? { ...prev, readingStatus: status as any } : null);
        toast({
          title: "Status updated",
          description: `Marked as "${READING_STATUS_LABELS[status]}"`
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update reading status",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReview = async (data: { rating: number; content: string }) => {
    if (!id) return;

    try {
      setIsSubmittingReview(true);
      
      let response;
      if (editingReview) {
        response = await api.updateReview(editingReview.id, data);
      } else {
        response = await api.createReview({
          bookId: id,
          ...data
        });
      }

      if (response.success) {
        toast({
          title: editingReview ? "Review updated" : "Review posted",
          description: "Thank you for sharing your thoughts!"
        });
        
        // Refresh reviews
        const reviewsResponse = await api.getBookReviews(id);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        }
        
        setShowReviewForm(false);
        setEditingReview(null);
      }
    } catch (error) {
      toast({
        title: "Review failed",
        description: "Failed to submit your review",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await api.deleteReview(reviewId);
      if (response.success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        toast({
          title: "Review deleted",
          description: "Your review has been removed"
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete review",
        variant: "destructive"
      });
    }
  };

  const userReview = user ? reviews.find(r => r.userId === user.id) : null;
  const otherReviews = user ? reviews.filter(r => r.userId !== user.id) : reviews;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded animate-pulse"></div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              <div className="h-20 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book not found</h1>
          <Link to="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Navigation */}
        <Link to="/books" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Books
        </Link>

        {/* Book Details */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Book Cover */}
          <div className="space-y-4">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg border">
              <img
                src={book.coverImageUrl || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Library Actions */}
            {isAuthenticated && (
              <div className="space-y-3">
                {userBook ? (
                  <div className="space-y-3">
                    <Badge variant="default" className="w-full justify-center py-2">
                      {READING_STATUS_LABELS[userBook.readingStatus]}
                    </Badge>
                    {userBook.readingStatus === 1 && (
                      <ProgressTracker
                        bookTitle={book.title}
                        currentProgress={userBook.progress}
                        readingStatus={userBook.readingStatus}
                        startedAt={userBook.startedAt}
                        onProgressUpdate={handleProgressUpdate}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAddToLibrary(0)}
                      variant="outline"
                      className="w-full"
                    >
                      Want to Read
                    </Button>
                    <Button
                      onClick={() => handleAddToLibrary(1)}
                      className="w-full"
                    >
                      Start Reading
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book Information */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{book.authors.map(a => a.name).join(", ")}</span>
                </div>
                {book.publicationYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{book.publicationYear}</span>
                  </div>
                )}
                {book.publisherName && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{book.publisherName}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <RatingStars rating={averageRating} />
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                </div>
              )}
            </div>

            {/* Book Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {book.language && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{book.language}</span>
                  </div>
                )}
                {book.publisherName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Publisher:</span>
                    <span>{book.publisherName}</span>
                  </div>
                )}
                {book.publicationYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <span>{book.publicationYear}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reviews</h2>
            {isAuthenticated && !userReview && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <ReviewForm
              bookId={book.id}
              bookTitle={book.title}
              onSubmit={handleSubmitReview}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
              initialData={editingReview || undefined}
              isLoading={isSubmittingReview}
            />
          )}

          {/* User's Review */}
          {userReview && !showReviewForm && (
            <div className="space-y-2">
              <h3 className="font-medium">Your Review</h3>
              <ReviewCard
                review={userReview}
                onEdit={(review) => {
                  setEditingReview(review);
                  setShowReviewForm(true);
                }}
                onDelete={handleDeleteReview}
              />
            </div>
          )}

          {/* Other Reviews */}
          {otherReviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Community Reviews</h3>
              <div className="space-y-4">
                {otherReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}

          {/* No Reviews */}
          {reviews.length === 0 && !showReviewForm && (
            <div className="text-center py-8">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your thoughts about this book
              </p>
              {isAuthenticated && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write First Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
