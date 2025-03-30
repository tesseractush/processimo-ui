import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AuthTabs from "@/components/auth/auth-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for error query parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");
    
    if (error === "google-auth-failed") {
      setErrorMessage("Google authentication failed. Please try again or use another sign-in method.");
    } else if (error === "github-auth-failed") {
      setErrorMessage("GitHub authentication failed. Please try again or use another sign-in method.");
    }
    
    // Clear the error from the URL to prevent showing the message again on refresh
    if (error) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      {errorMessage && (
        <div className="w-full max-w-md mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="w-full max-w-md">
        <AuthTabs />
      </div>
    </div>
  );
}
