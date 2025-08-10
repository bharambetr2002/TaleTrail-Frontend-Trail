import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Target, Trash2 } from "lucide-react";
import { UserBookResponseDTO, READING_STATUS, READING_STATUS_LABELS } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ProgressTracker } from "@/components/layout/ProgressTracker";
import { Header } from "@/components/layout/Header";

export default function MyLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userBooks, setUserBooks] = useState<UserBookResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadMyBooks();
  }, []);

  const loadMyBooks = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMyBooks();
      if (response.success) {
        setUserBooks(response.data);
      }
    } catch (error) {
      toast({
        title: "Error loading library",
        description: "Failed to load your books",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async (bookId: string, progress: number) => {
    try {
      const book = userBooks.find(b => b.bookId === bookId);
      if (!book) return;

      const response = await api.updateBookStatus(bookId, {
        readingStatus: book.readingStatus,
        progress
      });

      if (response.success) {
        setUserBooks(books => 
          books.map(b => 
            b.bookId === bookId ? { ...b, progress } : b
          )
        );
        toast({
          title: "Progress updated",
          description: `${book.bookTitle} is now ${progress}% complete`
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update reading progress",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (bookId: string, status: number) => {
    try {
      const book = userBooks.find(b => b.bookId === bookId);
      if (!book) return;

      const response = await api.updateBookStatus(bookId, {
        readingStatus: status,
        progress: book.progress
      });

      if (response.success) {
        setUserBooks(books => 
          books.map(b => 
            b.bookId === bookId ? { ...b, readingStatus: status as any } : b
          )
        );
        toast({
          title: "Status updated",
          description: `${book.bookTitle} marked as ${READING_STATUS_LABELS[status]}`
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

  const handleRemoveBook = async (bookId: string) => {
    try {
      const book = userBooks.find(b => b.bookId === bookId);
      if (!book) return;

      const response = await api.removeBookFromLibrary(bookId);
      if (response.success) {
        setUserBooks(books => books.filter(b => b.bookId !== bookId));
        toast({
          title: "Book removed",
          description: `${book.bookTitle} removed from your library`
        });
      }
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Failed to remove book from library",
        variant: "destructive"
      });
    }
  };

  const filterBooks = (status?: number) => {
    if (status === undefined) return userBooks;
    return userBooks.filter(book => book.readingStatus === status);
  };

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case READING_STATUS.TO_READ: return "outline";
      case READING_STATUS.IN_PROGRESS: return "default";
      case READING_STATUS.COMPLETED: return "secondary";
      case READING_STATUS.DROPPED: return "destructive";
      default: return "outline";
    }
  };

  const stats = {
    total: userBooks.length,
    toRead: filterBooks(READING_STATUS.TO_READ).length,
    reading: filterBooks(READING_STATUS.IN_PROGRESS).length,
    completed: filterBooks(READING_STATUS.COMPLETED).length,
    dropped: filterBooks(READING_STATUS.DROPPED).length
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header
            user={user}
            onSearch={handleSearch}
            onSignOut={logout}
          />
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">My Library</h1>
        <p className="text-muted-foreground">
          Track your reading journey and manage your book collection
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Books</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.toRead}</div>
            <div className="text-sm text-muted-foreground">To Read</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.reading}</div>
            <div className="text-sm text-muted-foreground">Reading</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.dropped}</div>
            <div className="text-sm text-muted-foreground">Dropped</div>
          </CardContent>
        </Card>
      </div>

      {/* Books by Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="to-read">To Read ({stats.toRead})</TabsTrigger>
          <TabsTrigger value="reading">Reading ({stats.reading})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="dropped">Dropped ({stats.dropped})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BooksGrid 
            books={userBooks} 
            onProgressUpdate={handleProgressUpdate}
            onStatusUpdate={handleStatusUpdate}
            onRemoveBook={handleRemoveBook}
          />
        </TabsContent>

        <TabsContent value="to-read" className="mt-6">
          <BooksGrid 
            books={filterBooks(READING_STATUS.TO_READ)} 
            onProgressUpdate={handleProgressUpdate}
            onStatusUpdate={handleStatusUpdate}
            onRemoveBook={handleRemoveBook}
          />
        </TabsContent>

        <TabsContent value="reading" className="mt-6">
          <BooksGrid 
            books={filterBooks(READING_STATUS.IN_PROGRESS)} 
            onProgressUpdate={handleProgressUpdate}
            onStatusUpdate={handleStatusUpdate}
            onRemoveBook={handleRemoveBook}
            showProgress
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <BooksGrid 
            books={filterBooks(READING_STATUS.COMPLETED)} 
            onProgressUpdate={handleProgressUpdate}
            onStatusUpdate={handleStatusUpdate}
            onRemoveBook={handleRemoveBook}
          />
        </TabsContent>

        <TabsContent value="dropped" className="mt-6">
          <BooksGrid 
            books={filterBooks(READING_STATUS.DROPPED)} 
            onProgressUpdate={handleProgressUpdate}
            onStatusUpdate={handleStatusUpdate}
            onRemoveBook={handleRemoveBook}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {userBooks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start building your library by adding books you want to read
            </p>
            <Link to="/books">
              <Button>Browse Books</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}

interface BooksGridProps {
  books: UserBookResponseDTO[];
  onProgressUpdate: (bookId: string, progress: number) => void;
  onStatusUpdate: (bookId: string, status: number) => void;
  onRemoveBook: (bookId: string) => void;
  showProgress?: boolean;
}

function BooksGrid({ books, onProgressUpdate, onStatusUpdate, onRemoveBook, showProgress }: BooksGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No books in this category</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden">
          <div className="aspect-[3/4] relative">
            <img
              src={book.bookCoverUrl || "/placeholder.svg"}
              alt={book.bookTitle}
              className="w-full h-full object-cover"
            />
            <Badge
              variant={
                book.readingStatus === READING_STATUS.TO_READ ? "outline" :
                book.readingStatus === READING_STATUS.IN_PROGRESS ? "default" :
                book.readingStatus === READING_STATUS.COMPLETED ? "secondary" : "destructive"
              }
              className="absolute top-2 right-2"
            >
              {READING_STATUS_LABELS[book.readingStatus]}
            </Badge>
            {book.progress > 0 && (
              <div className="absolute bottom-2 left-2 right-2">
                <Progress value={book.progress} className="h-1" />
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold line-clamp-2">{book.bookTitle}</h3>
              {book.startedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  Started {new Date(book.startedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {showProgress && book.readingStatus === READING_STATUS.IN_PROGRESS && (
              <ProgressTracker
                bookTitle={book.bookTitle}
                currentProgress={book.progress}
                readingStatus={book.readingStatus}
                startedAt={book.startedAt}
                onProgressUpdate={(progress) => onProgressUpdate(book.bookId, progress)}
                onStatusUpdate={(status) => onStatusUpdate(book.bookId, status)}
              />
            )}

            <div className="flex gap-2">
              <Link to={`/books/${book.bookId}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveBook(book.bookId)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}