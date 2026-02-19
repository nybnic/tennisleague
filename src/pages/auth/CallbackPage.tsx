import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useUser();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your magic link...");

  useEffect(() => {
    // Supabase automatically handles the magic link callback
    // The token is in the URL hash and is processed by the auth client
    // We just need to listen for the auth state change

    if (isLoading) {
      setStatus("loading");
      setMessage("Verifying your magic link...");
    } else if (isAuthenticated) {
      setStatus("success");
      setMessage("Welcome! Redirecting to your league...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setStatus("error");
      setMessage("Failed to verify magic link. Please try signing in again.");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying Magic Link</CardTitle>
          <CardDescription>Please wait while we verify your account</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-center text-gray-700">{message}</p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <button
                onClick={() => navigate("/auth/sign-in")}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
