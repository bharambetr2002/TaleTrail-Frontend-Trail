import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { BookCard } from "@/components/books/BookCard";
import { useAuth } from "@/contexts/AuthContext";
import { api, READING_STATUS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  description: string;
  language: string;
  coverImageUrl: string;
  publicationYear: number;
  publisherName: string;
  authors: Array<{
    id: string;
    name: string;
  }>;
}

export default function BooksCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (search?: string) => {
    setIsLoading(true);
    try {
      const response = await api.getBooks(search);
      if (response.success) {
        setBooks(response.data as Book[]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchBooks(query);
  };

  const handleAddToLibrary = async (bookId: string, status: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add books to your library.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.addBookToLibrary({
        bookId,
        readingStatus: status,
        progress: status === READING_STATUS.COMPLETED ? 100 : 0,
      });

      if (response.success) {
        toast({
          title: "Book added!",
          description: "Successfully added to your library.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to library. Please try again.",
        variant: "destructive",
      });
    }
  };

  // FIX: Add proper navigation function
  const handleViewBook = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSearch={handleSearch} onSignOut={logout} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Discover Books
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our vast collection of books and find your next great read
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="bg-card-gradient border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for books, authors, publishers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearch(searchQuery)
                    }
                    className="pl-10 bg-background/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSearch(searchQuery)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {books.length} books found
            </p>
            {searchQuery && (
              <Badge variant="outline" className="gap-1">
                <Search className="h-3 w-3" />
                {searchQuery}
              </Badge>
            )}
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "grid" | "list")}
          >
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <Grid className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Books Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Loading amazing books for you...
              </p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="space-y-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-muted-foreground">
                No books found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : "No books available at the moment."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    fetchBooks();
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Tabs value={viewMode} className="w-full">
            <TabsContent value="grid">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToLibrary={handleAddToLibrary}
                    onView={handleViewBook}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {books.map((book) => (
                  <Card
                    key={book.id}
                    className="overflow-hidden hover:shadow-card transition-smooth"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={book.coverImageUrl || "/placeholder.svg"}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg leading-tight">
                            {book.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by{" "}
                            {book.authors
                              .map((author) => author.name)
                              .join(", ")}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{book.publicationYear}</span>
                            <span>•</span>
                            <span>{book.language}</span>
                            <span>•</span>
                            <span>{book.publisherName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {book.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBook(book.id)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAddToLibrary(
                                book.id,
                                READING_STATUS.TO_READ
                              )
                            }
                          >
                            Want to Read
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleAddToLibrary(
                                book.id,
                                READING_STATUS.IN_PROGRESS
                              )
                            }
                          >
                            Start Reading
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
