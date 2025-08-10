import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
                <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
                <p className="text-muted-foreground">
                  Oops! The page you're looking for doesn't exist.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>

              <Link to="/books" className="block">
                <Button variant="outline" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Books
                </Button>
              </Link>
            </div>

            <div className="text-xs text-muted-foreground">
              Path: {location.pathname}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
