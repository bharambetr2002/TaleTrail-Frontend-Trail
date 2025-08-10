import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BookOpen, User } from "lucide-react";
import { BlogResponseDTO } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { BlogCard } from "@/components/blogs/BlogCard";
import { Header } from "@/components/layout/Header";

export default function Blogs() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogResponseDTO[]>([]);
  const [myBlogs, setMyBlogs] = useState<BlogResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loadBlogs = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all blogs
      const allBlogsResponse = await api.getBlogs();
      if (allBlogsResponse?.success) {
        setBlogs(allBlogsResponse.data);
      }

      // Fetch user's blogs if authenticated
      if (isAuthenticated && user?.id) {
        const userBlogsResponse = await api.getBlogsByUser(user.id);
        if (userBlogsResponse?.success) {
          setMyBlogs(userBlogsResponse.data);
        }
      }
    } catch {
      toast({
        title: "Error loading blogs",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, toast]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleBlogView = (blogId: string) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleBlogLike = async (blogId: string, isLiked: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to like blog posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await api.unlikeBlog(blogId);
      } else {
        await api.likeBlog(blogId);
      }
      loadBlogs();
    } catch {
      toast({
        title: "Action failed",
        description: "Failed to update blog like status",
        variant: "destructive",
      });
    }
  };

  const handleBlogDelete = async (blogId: string) => {
    try {
      await api.deleteBlog(blogId);
      toast({
        title: "Blog deleted",
        description: "Your blog post has been deleted successfully",
      });
      loadBlogs();
    } catch {
      toast({
        title: "Delete failed",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyBlogs = myBlogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
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
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Community Blogs</h1>
            <p className="text-muted-foreground">
              Discover and share thoughts about your favorite books
            </p>
          </div>
          {isAuthenticated && (
            <Link to="/blogs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Write Blog
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search blogs, authors, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Blogs ({filteredBlogs.length})
            </TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger value="my-blogs" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Blogs ({filteredMyBlogs.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredBlogs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onView={handleBlogView}
                    onLike={handleBlogLike}
                    showActions={isAuthenticated}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Be the first to share your thoughts!"}
                </p>
              </div>
            )}
          </TabsContent>

          {isAuthenticated && (
            <TabsContent value="my-blogs" className="mt-6">
              {filteredMyBlogs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMyBlogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      onView={handleBlogView}
                      onEdit={(id) => navigate(`/blogs/${id}/edit`)}
                      onDelete={handleBlogDelete}
                      showAuthorActions
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    You haven't written any blogs yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Share your reading experiences and book recommendations with
                    the community
                  </p>
                  <Link to="/blogs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your First Blog
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Stats */}
        {blogs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {blogs.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Blogs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {blogs.reduce((total, blog) => total + blog.likeCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(blogs.map((blog) => blog.username)).size}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Bloggers
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
