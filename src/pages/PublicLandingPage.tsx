import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Target, Zap, Users } from 'lucide-react';

export default function PublicLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            🎾 Tennis League
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/auth/sign-in')} size="sm">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth/sign-up')} size="sm">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your Tennis League.
            <br />
            <span className="text-primary">Measured Properly.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Elo-based ratings, match predictions, rivalries and surface performance —
            built for competitive amateur leagues.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth/sign-up')}
              className="gap-2"
            >
              Create a League
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth/sign-in')}
            >
              Join a League
            </Button>
          </div>
        </div>
      </section>

    
      {/* Features Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Elevate your amateur tennis experience</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Dynamic Ratings */}
            <div className="rounded-lg border border-border/60 bg-card p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Dynamic Ratings</h3>
              </div>
              <p className="text-muted-foreground">
                Elo updates after every match. Upsets matter. Streaks matter. Progress is visible.
              </p>
            </div>

            {/* Match Predictions */}
            <div className="rounded-lg border border-border/60 bg-card p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Match Predictions</h3>
              </div>
              <p className="text-muted-foreground">
                See expected outcomes before you play. Understand the impact afterward.
              </p>
            </div>

            {/* Surface Performance */}
            <div className="rounded-lg border border-border/60 bg-card p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Surface Performance</h3>
              </div>
              <p className="text-muted-foreground">
                Clay, hard, grass — tracked separately. Strength is contextual.
              </p>
            </div>

            {/* Rivalries */}
            <div className="rounded-lg border border-border/60 bg-card p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Rivalries</h3>
              </div>
              <p className="text-muted-foreground">
                Head-to-head history. Momentum over time. Competitive narratives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="bg-muted/40 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple by Design
          </h2>
          
          <div className="space-y-4">
            <div className="text-lg">
              <span className="font-semibold">Create a league.</span>
              <br />
              <span className="text-muted-foreground">Set it up in seconds.</span>
            </div>
            <div className="text-lg">
              <span className="font-semibold">Invite players.</span>
              <br />
              <span className="text-muted-foreground">Magic links. No complexity.</span>
            </div>
            <div className="text-lg">
              <span className="font-semibold">Record matches.</span>
              <br />
              <span className="text-muted-foreground">Ratings update instantly.</span>
            </div>
          </div>

          <p className="text-muted-foreground max-w-xl mx-auto pt-4">
            Defaults work immediately. Configuration is optional.
          </p>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for Real Use
          </h2>
          
          <div className="space-y-3 text-base md:text-lg text-muted-foreground">
            <p>⚡ Fast result entry</p>
            <p>📊 Instant rating updates</p>
            <p>📱 Clean mobile interface</p>
            <p>📍 Check standings courtside</p>
            <p>🚀 Enter results in seconds</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary/5 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start Your League.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth/sign-up')}
              className="gap-2"
            >
              Create a League
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth/sign-in')}
            >
              Join a League
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>Your Tennis League. Measured Properly</p>
        </div>
      </footer>
    </div>
  );
}
