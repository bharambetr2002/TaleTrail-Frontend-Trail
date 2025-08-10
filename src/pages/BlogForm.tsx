import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function BlogForm() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isEditing) {
      loadBlog();
    }
  }, [isAuthenticated, isEditing, id]);

  const loadBlog = async () => {
    try {
      setIsLoading(true);
      const response = await api.getBlog(id!);
      if (response.success) {
        const blog = response.data as any;
        
        // Check if user is the author
        if (blog.userId !== user?.id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own blog posts",
            variant: "destructive"
          });
          navigate("/blogs");
          return;
        }

        setTitle(blog.title);
        setContent(blog.content);
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
        description: "Failed to load blog post for editing",
        variant: "destructive"
      });
      navigate("/blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation error",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const blogData = {
        title: title.trim(),
        content: content.trim()
      };

      let response;
      if (isEditing) {
        response = await api.updateBlog(id!, blogData);
      } else {
        response = await api.createBlog(blogData);
      }

      if (response.success) {
        toast({
          title: isEditing ? "Blog updated" : "Blog published",
          description: isEditing 
            ? "Your blog post has been updated successfully"
            : "Your blog post has been published successfully"
        });
        
        // Navigate to the blog detail page
        const blogId = isEditing ? id : response.data.id;
        navigate(`/blogs/${blogId}`);
      }
    } catch (error) {
      toast({
        title: isEditing ? "Update failed" : "Publish failed",
        description: isEditing 
          ? "Failed to update blog post"
          : "Failed to publish blog post",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/blogs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Blog Post" : "Write New Blog Post"}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={!title.trim() && !content.trim()}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {isPreview ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {title || "Untitled Blog Post"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>By {user?.fullName || user?.username}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {content || "Your blog content will appear here..."}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog post title..."
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here... Share your thoughts about books, reading experiences, reviews, or any book-related topics."
                  className="mt-1 min-h-[400px] resize-y"
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {content.length} characters
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link to="/blogs">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading || !title.trim() || !content.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading 
                ? (isEditing ? "Updating..." : "Publishing...") 
                : (isEditing ? "Update Blog" : "Publish Blog")
              }
            </Button>
          </div>
        </form>
      )}

      {/* Writing Tips */}
      {!isPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Writing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary">📚</span>
                <span>Share your genuine thoughts and experiences with books</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary">✨</span>
                <span>Include specific examples and quotes that resonated with you</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary">🎯</span>
                <span>Be authentic and honest in your reviews and recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary">💡</span>
                <span>Consider discussing themes, writing style, or how the book affected you</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
