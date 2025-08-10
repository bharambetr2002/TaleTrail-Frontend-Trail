import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Edit, Trash2, Eye } from "lucide-react";
import { BlogResponseDTO } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  blog: BlogResponseDTO;
  onLike?: (blogId: string, isLiked: boolean) => void;
  onEdit?: (blogId: string) => void;
  onDelete?: (blogId: string) => void;
  onView?: (blogId: string) => void;
  compact?: boolean;
  showActions?: boolean;
  showAuthorActions?: boolean;
}

export function BlogCard({
  blog,
  onLike,
  onEdit,
  onDelete,
  onView,
  compact = false,
  showActions = true,
  showAuthorActions = false
}: BlogCardProps) {
  const { user, isAuthenticated } = useAuth();
  const isOwnBlog = user?.id === blog.userId;

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !onLike) return;
    onLike(blog.id, blog.isLikedByCurrentUser);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(blog.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(blog.id);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <Card className="transition-smooth hover:shadow-card cursor-pointer" onClick={() => onView?.(blog.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.username}`} />
              <AvatarFallback>{blog.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{blog.username}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {(showAuthorActions && isOwnBlog) && (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{blog.title}</h3>
        <div 
          className={cn(
            "text-sm text-muted-foreground leading-relaxed mb-4",
            compact ? "line-clamp-2" : "line-clamp-3"
          )}
          dangerouslySetInnerHTML={{ 
            __html: compact ? truncateContent(blog.content, 100) : truncateContent(blog.content)
          }}
        />
        
        <div className="flex items-center justify-between">
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={cn(
                "gap-2 text-muted-foreground hover:text-primary",
                blog.isLikedByCurrentUser && "text-red-500 hover:text-red-600"
              )}
              disabled={!isAuthenticated}
            >
              <Heart className={cn("h-4 w-4", blog.isLikedByCurrentUser && "fill-current")} />
              {blog.likeCount}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(blog.id);
            }}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}