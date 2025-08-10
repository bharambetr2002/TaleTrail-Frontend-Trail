import {
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  // FIX: Use proper image URLs instead of non-existent imports
  const heroImage =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80";
  const readingNookImage =
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop&q=80";

  const features = [
    {
      icon: BookOpen,
      title: "Track Your Reading",
      description:
        "Organize your books with intuitive reading statuses and progress tracking",
    },
    {
      icon: Users,
      title: "Join the Community",
      description:
        "Connect with fellow book lovers, share reviews, and discover new reads",
    },
    {
      icon: TrendingUp,
      title: "Reading Analytics",
      description:
        "Visualize your reading habits and set meaningful reading goals",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Avid Reader",
      content:
        "TaleTrail has completely transformed how I track and discover books. The community features are amazing!",
      rating: 5,
    },
    {
      name: "Marcus Thompson",
      role: "Book Blogger",
      content:
        "Finally, a book tracking app that understands readers. The progress tracking is incredibly motivating.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      role: "Literature Teacher",
      content:
        "I recommend TaleTrail to all my students. It's the perfect tool for building reading habits.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="bg-white/10 text-white border-white/20"
                >
                  ✨ Join 10,000+ Book Lovers
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Your Literary Journey
                  <span className="text-gradient-accent block">
                    Starts Here
                  </span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed max-w-md">
                  Track, discover, and share your reading adventures with
                  TaleTrail - the most beautiful way to organize your book life.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="group bg-accent hover:bg-accent/90 text-white"
                  onClick={() => navigate("/signup")}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/books")}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Explore Books
                </Button>
              </div>

              <div className="flex items-center gap-8 text-white/60">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">10k+ users</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-glow">
                <img
                  src={heroImage}
                  alt="Beautiful reading scene"
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating UI Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-book animate-bounce">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute top-1/2 -left-4 bg-accent rounded-lg p-3 shadow-book animate-pulse">
                <Star className="h-5 w-5 text-white fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Everything You Need to
              <span className="text-gradient-primary"> Love Reading</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover why thousands of readers choose TaleTrail to enhance
              their reading experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group bg-card-gradient border-border/50 hover:shadow-card transition-smooth"
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reading Nook Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src={readingNookImage}
                alt="Cozy reading nook"
                className="w-full rounded-2xl shadow-book"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="bg-accent/10 text-accent border-accent/20"
                >
                  📚 Personal Library
                </Badge>
                <h2 className="text-4xl font-bold text-foreground">
                  Your Books,
                  <span className="text-gradient-accent"> Your Way</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Organize your reading life with intuitive status tracking,
                  progress monitoring, and personalized reading goals. Every
                  book tells a story - let us help you tell yours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Smart Progress Tracking</h4>
                    <p className="text-muted-foreground text-sm">
                      Visual progress bars and reading statistics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Reading Goals</h4>
                    <p className="text-muted-foreground text-sm">
                      Set and achieve your annual reading targets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-book-brown mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Beautiful Organization</h4>
                    <p className="text-muted-foreground text-sm">
                      Elegant library views and filtering options
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="group bg-accent hover:bg-accent/90 text-white"
                onClick={() => navigate("/signup")}
              >
                Start Organizing Today
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">
              Loved by{" "}
              <span className="text-gradient-primary">Readers Everywhere</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about TaleTrail
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card-gradient border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Reading Life?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of book lovers who've already discovered the joy of
              organized reading with TaleTrail.
            </p>
            <Button
              size="lg"
              className="group shadow-glow bg-accent hover:bg-accent/90 text-white"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-white/60 text-sm">
              No credit card required • Free forever
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
