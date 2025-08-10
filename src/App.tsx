import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/books" element={<BooksCatalog />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/:id" element={<Authors />} />
            <Route path="/publishers" element={<Publishers />} />
            <Route path="/publishers/:id" element={<Publishers />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blogs/new"
              element={
                <ProtectedRoute>
                  <BlogForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blogs/:id/edit"
              element={
                <ProtectedRoute>
                  <BlogForm />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route - MUST be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
