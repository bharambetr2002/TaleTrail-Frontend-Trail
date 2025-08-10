import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Calendar, Edit, Trash2, ArrowLeft, User } from "lucide-react";
import { BlogResponseDTO } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Header } from "@/components/layout/Header";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBlog();
    }
  }, [id]);

  const loadBlog = async () => {
    try {
      setIsLoading(true);
      const response = await api.getBlog(id!);
      if (response.success) {
        setBlog(response.data);
      } else {
        toast({
          title: "Blog not found",
          description: "The requested blog post could not be found",
          variant: "destructive"
        });
        navigate("/blogs");
      }
    } catch (error) {
      toast({
        title: "Error loading blog",
        description: "Failed to load blog post",
        variant: "destructive"
      });
      navigate("/blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to like blog posts",
        variant: "destructive"
      });
      return;
    }

    if (!blog) return;

    try {
      if (blog.isLikedByCurrentUser) {
        await api.unlikeBlog(blog.id);
      } else {
        await api.likeBlog(blog.id);
      }
      
      // Update the blog state
      setBlog(prev => prev ? {
        ...prev,
        isLikedByCurrentUser: !prev.isLikedByCurrentUser,
        likeCount: prev.isLikedByCurrentUser ? prev.likeCount - 1 : prev.likeCount + 1
      } : null);
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!blog) return;

    try {
      await api.deleteBlog(blog.id);
      toast({
        title: "Blog deleted",
        description: "Your blog post has been deleted successfully"
      });
      navigate("/blogs");
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };

  const isAuthor = user?.id === blog?.userId;
  const canEdit = isAuthenticated && isAuthor;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Blog not found</h2>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blogs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link to="/blogs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>
        
        {canEdit && (
          <div className="flex gap-2 ml-auto">
            <Link to={`/blogs/${blog.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this blog post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Blog Content */}
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">{blog.title}</h1>
          </div>
          
          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`/placeholder.svg`} />
                <AvatarFallback>
                  {blog.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/profile/${blog.username}`} className="font-medium hover:underline">
                  {blog.username}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {blog.updatedAt !== blog.createdAt && (
                    <span>(edited {new Date(blog.updatedAt).toLocaleDateString()})</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Engagement Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                {blog.likeCount}
              </div>
            </div>
          </div>

          <Separator />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Blog Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {blog.content}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={blog.isLikedByCurrentUser ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={!isAuthenticated}
                className={blog.isLikedByCurrentUser ? "bg-pink-600 hover:bg-pink-700" : ""}
              >
                <Heart className={`h-4 w-4 mr-2 ${blog.isLikedByCurrentUser ? "fill-current" : ""}`} />
                {blog.isLikedByCurrentUser ? "Liked" : "Like"} ({blog.likeCount})
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Share your thoughts about this blog</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Author's Other Blogs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            More from {blog.username}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Other blogs from this author will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
