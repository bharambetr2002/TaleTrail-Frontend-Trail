import { Star, BookOpen, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { READING_STATUS_LABELS, type ReadingStatus } from "@/lib/api";

interface Author {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  description: string;
  language: string;
  coverImageUrl: string;
  publicationYear: number;
  publisherName: string;
  authors: Author[];
}

interface UserBook extends Book {
  readingStatus: ReadingStatus;
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

interface BookCardProps {
  book: Book | UserBook;
  onAddToLibrary?: (bookId: string, status: ReadingStatus) => void;
  onUpdateStatus?: (bookId: string, status: ReadingStatus) => void;
  onViewDetails?: (bookId: string) => void;
  showStatus?: boolean;
  compact?: boolean;
}

const getStatusBadgeVariant = (status: ReadingStatus) => {
  switch (status) {
    case 0: return "outline"; // To Read
    case 1: return "default"; // Reading
    case 2: return "secondary"; // Completed
    case 3: return "destructive"; // Dropped
    default: return "outline";
  }
};

export function BookCard({ 
  book, 
  onAddToLibrary, 
  onUpdateStatus, 
  onViewDetails,
  showStatus = false,
  compact = false 
}: BookCardProps) {
  const isUserBook = 'readingStatus' in book;
  const userBook = isUserBook ? book as UserBook : null;

  const handleAddToLibrary = (status: ReadingStatus) => {
    if (onAddToLibrary) {
      onAddToLibrary(book.id, status);
    }
  };

  const handleStatusUpdate = (status: ReadingStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(book.id, status);
    }
  };

  return (
    <Card className="group overflow-hidden transition-smooth hover:shadow-book bg-card-gradient border-border/50">
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={book.coverImageUrl || "/placeholder.svg"}
          alt={book.title}
          className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
        
        {showStatus && userBook && (
          <Badge
            variant={getStatusBadgeVariant(userBook.readingStatus)}
            className="absolute top-2 right-2"
          >
            {READING_STATUS_LABELS[userBook.readingStatus]}
          </Badge>
        )}

        {userBook?.progress !== undefined && userBook.progress > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-md p-2">
              <div className="flex items-center justify-between text-white text-xs mb-1">
                <span>Progress</span>
                <span>{userBook.progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <div
                  className="bg-accent h-1 rounded-full transition-all duration-300"
                  style={{ width: `${userBook.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 
            className="font-semibold text-sm leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-smooth"
            onClick={() => onViewDetails?.(book.id)}
          >
            {book.title}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="line-clamp-1">
              {book.authors.map(author => author.name).join(", ")}
            </span>
          </div>

          {!compact && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{book.publicationYear}</span>
                <span>•</span>
                <span>{book.language}</span>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {book.description}
              </p>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isUserBook ? (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails?.(book.id)}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => handleStatusUpdate(1)} // Set to reading
            >
              Update
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleAddToLibrary(0)} // To Read
            >
              Want to Read
            </Button>
            <Button
              variant="accent"
              size="sm"
              className="flex-1"
              onClick={() => handleAddToLibrary(1)} // Reading
            >
              Start Reading
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}