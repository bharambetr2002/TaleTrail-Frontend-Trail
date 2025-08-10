import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Edit,
  Save,
  X,
  BookOpen,
  FileText,
  Calendar,
} from "lucide-react";
import { UserProfileDTO, BlogResponseDTO } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [userBlogs, setUserBlogs] = useState<BlogResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    avatarUrl: "",
  });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      let profileData: UserProfileDTO;

      if (isOwnProfile && currentUser) {
        // Load own profile from auth context
        profileData = currentUser;
        setProfile(currentUser);
        setEditForm({
          fullName: currentUser.fullName,
          username: currentUser.username,
          bio: currentUser.bio || "",
          avatarUrl: currentUser.avatarUrl || "",
        });
      } else {
        // Load public profile
        const response = await api.getPublicProfile(username!);
        if (response.success) {
          profileData = response.data;
          setProfile(response.data);
        } else {
          toast({
            title: "Profile not found",
            description: "The requested user profile could not be found",
            variant: "destructive",
          });
          return;
        }
      }

      // FIX: Load user's blogs with proper API call and correct timing
      if (profileData?.id) {
        try {
          const blogsResponse = await api.getBlogs(profileData.id);
          if (blogsResponse.success && Array.isArray(blogsResponse.data)) {
            setUserBlogs(blogsResponse.data);
          }
        } catch (error) {
          console.error("Failed to load user blogs:", error);
          // Don't show error toast for blogs, just log it
        }
      }
    } catch (error) {
      toast({
        title: "Error loading profile",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.updateProfile(editForm);
      if (response.success) {
        setProfile(response.data);
        updateUser(response.data);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName,
        username: profile.username,
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">User not found</h2>
            <p className="text-muted-foreground">
              The user profile you're looking for doesn't exist.
            </p>
            <Link to="/" className="mt-4 inline-block">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                      <p className="text-muted-foreground">
                        @{profile.username}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Joined{" "}
                        {new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                          }
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="mt-6">
              {isEditing ? (
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell us about yourself and your reading interests..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">
                    {profile.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="blogs">
          <TabsList>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog Posts ({userBlogs.length})
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Reading Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="mt-6">
            {userBlogs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {userBlogs.map((blog) => (
                  <Card
                    key={blog.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          <Link
                            to={`/blogs/${blog.id}`}
                            className="hover:underline"
                          >
                            {blog.title}
                          </Link>
                        </CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {blog.likeCount} ❤️
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                        {blog.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                        <Link to={`/blogs/${blog.id}`}>
                          <Button variant="ghost" size="sm">
                            Read More →
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No blog posts yet
                </h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Start sharing your reading experiences by writing your first blog post"
                    : `${profile.fullName} hasn't published any blog posts yet`}
                </p>
                {isOwnProfile && (
                  <Link to="/blogs/new" className="mt-4 inline-block">
                    <Button>Write Your First Blog</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reading" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Reading Activity
                  </h3>
                  <p>Reading statistics and activity will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
