import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building, Book, Calendar } from "lucide-react";
import { PublisherResponseDTO, BookResponseDTO } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "react-router-dom";
import { BookCard } from "@/components/books/BookCard";

export default function Publishers() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [publishers, setPublishers] = useState<PublisherResponseDTO[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherResponseDTO | null>(null);
  const [publisherBooks, setPublisherBooks] = useState<BookResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPublishers();
    if (id) {
      loadPublisher(id);
    }
  }, [id]);

  const loadPublishers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPublishers();
      if (response.success) {
        setPublishers(response.data);
      }
    } catch (error) {
      toast({
        title: "Error loading publishers",
        description: "Failed to load publishers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublisher = async (publisherId: string) => {
    try {
      const [publisherResponse, booksResponse] = await Promise.all([
        api.getPublisher(publisherId),
        api.getBooks() // We'll need to filter by publisher on the frontend since the API doesn't have this endpoint
      ]);

      if (publisherResponse.success) {
        setSelectedPublisher(publisherResponse.data);
      }

      if (booksResponse.success) {
        // Filter books by publisher
        const filteredBooks = booksResponse.data.filter((book: BookResponseDTO) => 
          book.publisherId === publisherId
        );
        setPublisherBooks(filteredBooks);
      }
    } catch (error) {
      toast({
        title: "Error loading publisher",
        description: "Failed to load publisher details",
        variant: "destructive"
      });
    }
  };

  const filteredPublishers = publishers.filter(publisher =>
    publisher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
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

  // If showing specific publisher
  if (id && selectedPublisher) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Publisher Header */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <h1 className="text-3xl font-bold">{selectedPublisher.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Book className="h-4 w-4" />
                      {selectedPublisher.bookCount} books
                    </div>
                    {selectedPublisher.foundedYear && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Founded {selectedPublisher.foundedYear}
                      </div>
                    )}
                  </div>
                  {selectedPublisher.address && (
                    <p className="text-muted-foreground">{selectedPublisher.address}</p>
                  )}
                </div>
              </div>
              
              {selectedPublisher.description && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedPublisher.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Publisher's Books */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Books by {selectedPublisher.name}</h2>
            <Badge variant="outline">{publisherBooks.length} books</Badge>
          </div>
          
          {publisherBooks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publisherBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onView={(id) => window.location.href = `/books/${id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">
                No books are currently available from this publisher.
              </p>
            </div>
          )}
        </div>

        {/* Back to Publishers */}
        <div className="text-center">
          <Link to="/publishers">
            <Button variant="outline">
              View All Publishers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Publishers listing page
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Publishers</h1>
        <p className="text-muted-foreground">
          Explore books from different publishers
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search publishers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Publishers Grid */}
      {filteredPublishers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPublishers.map((publisher) => (
            <Card key={publisher.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{publisher.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Book className="h-3 w-3" />
                      {publisher.bookCount} books
                    </div>
                    {publisher.foundedYear && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Founded {publisher.foundedYear}
                      </div>
                    )}
                    {publisher.address && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {publisher.address}
                      </div>
                    )}
                  </div>
                </div>
                
                {publisher.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {publisher.description}
                  </p>
                )}
                
                <div className="mt-4">
                  <Link to={`/publishers/${publisher.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Building className="h-3 w-3 mr-2" />
                      View Publisher
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No publishers found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "No publishers available"}
          </p>
        </div>
      )}
    </div>
  );
}
