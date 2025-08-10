import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  Book,
  Users,
} from "lucide-react";
import { UserBookResponseDTO, BlogResponseDTO } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/books/BookCard";
import { BlogCard } from "@/components/blogs/BlogCard";
import { Header } from "@/components/layout/Header";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userBooks, setUserBooks] = useState<UserBookResponseDTO[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Load user's books
        const booksResponse = await api.getMyBooks();
        if (booksResponse.success && Array.isArray(booksResponse.data)) {
          setUserBooks(booksResponse.data);
        }

        // FIX: Load recent community blogs with proper error handling
        try {
          const blogsResponse = await api.getBlogs();
          if (blogsResponse.success && Array.isArray(blogsResponse.data)) {
            setRecentBlogs(blogsResponse.data.slice(0, 3)); // Show latest 3
          }
        } catch (blogError) {
          console.error("Failed to load recent blogs:", blogError);
          // Don't fail the entire dashboard if blogs fail to load
        }
      } catch (error) {
        toast({
          title: "Error loading dashboard",
          description: "Failed to load your reading data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  // Calculate reading statistics
  const stats = {
    totalBooks: userBooks.length,
    completed: userBooks.filter((book) => book.readingStatus === 2).length,
    inProgress: userBooks.filter((book) => book.readingStatus === 1).length,
    toRead: userBooks.filter((book) => book.readingStatus === 0).length,
    avgProgress:
      userBooks.length > 0
        ? Math.round(
            userBooks.reduce((sum, book) => sum + book.progress, 0) /
              userBooks.length
          )
        : 0,
  };

  const currentlyReading = userBooks.filter((book) => book.readingStatus === 1);
  const recentlyCompleted = userBooks
    .filter((book) => book.readingStatus === 2 && book.completedAt)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 3);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Here's your reading journey overview
          </p>
        </div>

        {/* Reading Statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Books
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalBooks}
                  </p>
                </div>
                <Book className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.completed}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Reading Now
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.inProgress}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Avg Progress
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.avgProgress}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currently Reading */}
        {currentlyReading.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Currently Reading
                </CardTitle>
                <Link to="/library">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentlyReading.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={book.bookCoverUrl || "/placeholder.svg"}
                      alt={book.bookTitle}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{book.bookTitle}</h4>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={book.progress}
                          className="flex-1 h-2"
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {book.progress}%
                        </span>
                      </div>
                    </div>
                    <Link to={`/books/${book.bookId}`}>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/books">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <Book className="h-6 w-6" />
                  Browse Books
                </Button>
              </Link>
              <Link to="/library">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <BookOpen className="h-6 w-6" />
                  My Library
                </Button>
              </Link>
              <Link to="/blogs/new">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2"
                >
                  <Users className="h-6 w-6" />
                  Write Blog
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Community Activity */}
        {recentBlogs.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Community Blogs
                </CardTitle>
                <Link to="/blogs">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    compact
                    onView={(id) => (window.location.href = `/blogs/${id}`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {stats.totalBooks === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Start Your Reading Journey
              </h3>
              <p className="text-muted-foreground mb-6">
                Add your first book to begin tracking your reading progress
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
