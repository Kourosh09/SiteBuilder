import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/dashboard";

// Protected Dashboard Component - requires authentication
export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify-session");
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
      } catch (error) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the dashboard.",
          variant: "destructive"
        });
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return <Dashboard />;
}