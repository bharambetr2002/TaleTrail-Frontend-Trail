import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BooksCatalog from "./pages/BooksCatalog";
import BookDetail from "./pages/BookDetail";
import Dashboard from "./pages/Dashboard";
import MyLibrary from "./pages/MyLibrary";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import BlogForm from "./pages/BlogForm";
import UserProfile from "./pages/UserProfile";
import Authors from "./pages/Authors";
import Publishers from "./pages/Publishers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="/books" element={<BooksCatalog />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/new" element={<BlogForm />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/blogs/:id/edit" element={<BlogForm />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/:id" element={<Authors />} />
            <Route path="/publishers" element={<Publishers />} />
            <Route path="/publishers/:id" element={<Publishers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
