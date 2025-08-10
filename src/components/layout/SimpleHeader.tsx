import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function SimpleHeader() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Book className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-gradient-primary">TaleTrail</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-foreground/80 hover:text-foreground transition-smooth">
                Dashboard
              </Link>
              <Link to="/library" className="text-foreground/80 hover:text-foreground transition-smooth">
                My Library
              </Link>
              <Link to="/books" className="text-foreground/80 hover:text-foreground transition-smooth">
                Browse
              </Link>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/books" className="text-foreground/80 hover:text-foreground transition-smooth">
                Books
              </Link>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Join TaleTrail</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}