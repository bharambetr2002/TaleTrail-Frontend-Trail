import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, Book, Calendar } from "lucide-react";
import { AuthorResponseDTO, BookResponseDTO } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "react-router-dom";
import { BookCard } from "@/components/books/BookCard";

export default function Authors() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [authors, setAuthors] = useState<AuthorResponseDTO[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorResponseDTO | null>(null);
  const [authorBooks, setAuthorBooks] = useState<BookResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAuthors();
    if (id) {
      loadAuthor(id);
    }
  }, [id]);

  const loadAuthors = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAuthors();
      if (response.success) {
        setAuthors(response.data);
      }
    } catch (error) {
      toast({
        title: "Error loading authors",
        description: "Failed to load authors",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuthor = async (authorId: string) => {
    try {
      const [authorResponse, booksResponse] = await Promise.all([
        api.getAuthor(authorId),
        api.getBooksByAuthor(authorId)
      ]);

      if (authorResponse.success) {
        setSelectedAuthor(authorResponse.data);
      }

      if (booksResponse.success) {
        setAuthorBooks(booksResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error loading author",
        description: "Failed to load author details",
        variant: "destructive"
      });
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // If showing specific author
  if (id && selectedAuthor) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Author Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl">
                  {selectedAuthor.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{selectedAuthor.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Book className="h-4 w-4" />
                      {selectedAuthor.bookCount} books
                    </div>
                    {selectedAuthor.birthDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Born {new Date(selectedAuthor.birthDate).getFullYear()}
                        {selectedAuthor.deathDate && 
                          ` - ${new Date(selectedAuthor.deathDate).getFullYear()}`
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedAuthor.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">Biography</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAuthor.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Author's Books */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Books by {selectedAuthor.name}</h2>
            <Badge variant="outline">{authorBooks.length} books</Badge>
          </div>
          
          {authorBooks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {authorBooks.map((book) => (
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
                No books are currently available for this author.
              </p>
            </div>
          )}
        </div>

        {/* Back to Authors */}
        <div className="text-center">
          <Link to="/authors">
            <Button variant="outline">
              View All Authors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Authors listing page
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Authors</h1>
        <p className="text-muted-foreground">
          Discover books by your favorite authors
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Authors Grid */}
      {filteredAuthors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAuthors.map((author) => (
            <Card key={author.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{author.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Book className="h-3 w-3" />
                      {author.bookCount} books
                    </div>
                    {author.birthDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Born {new Date(author.birthDate).getFullYear()}
                        {author.deathDate && 
                          ` - ${new Date(author.deathDate).getFullYear()}`
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {author.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {author.bio}
                  </p>
                )}
                
                <div className="mt-4">
                  <Link to={`/authors/${author.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="h-3 w-3 mr-2" />
                      View Author
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No authors found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "No authors available"}
          </p>
        </div>
      )}
    </div>
  );
}
