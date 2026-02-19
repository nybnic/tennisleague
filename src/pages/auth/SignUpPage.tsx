import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, isLoading } = useUser();
  const [email, setEmail] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    if (!email || !pseudonym) {
      setError("Both email and pseudonym are required");
      setIsSubmitting(false);
      return;
    }

    if (pseudonym.length < 2) {
      setError("Pseudonym must be at least 2 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Starting sign up process...");
      await signUpWithEmail(email, pseudonym);
      console.log("Sign up successful");
      setSuccess(true);
      setEmail("");
      setPseudonym("");
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account to join leagues</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Account created! Check your email for a magic link to verify. It expires in 24 hours.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="pseudonym" className="block text-sm font-medium mb-2">
                Player Name
              </label>
              <Input
                id="pseudonym"
                type="text"
                placeholder="Your display name"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This is how you'll appear in league standings
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading || success}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/sign-in")}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
