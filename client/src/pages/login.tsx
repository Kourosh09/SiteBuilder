import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogIn, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface LoginState {
  username: string;
  password: string;
  isLoading: boolean;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [state, setState] = useState<LoginState>({
    username: "",
    password: "",
    isLoading: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.username.trim() || !state.password.trim()) {
      toast({
        title: "Login Required",
        description: "Please enter both username and password.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: state.username.trim(),
          password: state.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to BuildwiseAI!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-blue to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Welcome to BuildwiseAI
          </h1>
          <p className="text-neutral-600">
            Sign in to access your dashboard
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access BuildwiseAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={state.username}
                  onChange={(e) => setState(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                  data-testid="input-username"
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={state.password}
                  onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  data-testid="input-password"
                  className="pl-10"
                />
              </div>

              <Button
                type="submit"
                disabled={state.isLoading}
                className="w-full bg-brand-blue hover:bg-blue-700"
                data-testid="button-login"
              >
                {state.isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg border">
              <h4 className="font-medium text-neutral-900 mb-2">Demo Credentials:</h4>
              <div className="text-sm text-neutral-600 space-y-1">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> buildwise2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-brand-blue hover:underline text-sm"
            data-testid="link-home"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}