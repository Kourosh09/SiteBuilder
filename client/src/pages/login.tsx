import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Smartphone, 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  Timer,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface LoginState {
  step: "method" | "verify" | "success";
  method: "email" | "phone" | null;
  contact: string;
  code: string;
  isLoading: boolean;
  timeRemaining: number;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [state, setState] = useState<LoginState>({
    step: "method",
    method: null,
    contact: "",
    code: "",
    isLoading: false,
    timeRemaining: 0
  });

  const handleMethodSelect = (method: "email" | "phone") => {
    setState(prev => ({ ...prev, method, contact: "", code: "" }));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.contact.trim()) {
      toast({
        title: "Contact Required",
        description: `Please enter your ${state.method === "email" ? "email address" : "phone number"}.`,
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // For demo purposes, accept any email or phone and proceed to verification
      setState(prev => ({ 
        ...prev, 
        step: "verify", 
        isLoading: false, 
        timeRemaining: 300 // 5 minutes
      }));
      
      // Start countdown timer
      const timer = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timer);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      toast({
        title: "Code Sent!",
        description: `Verification code sent to your ${state.method === "email" ? "email" : "phone"}. Use code: 123456`
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.code || state.code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    // Demo code verification - accept 123456 or any 6 digits
    if (state.code === "123456" || state.code.length === 6) {
      setState(prev => ({ ...prev, step: "success", isLoading: false }));
      
      toast({
        title: "Login Successful!",
        description: "Welcome to BuildwiseAI!"
      });

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please use 123456 for demo.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleResendCode = async () => {
    setState(prev => ({ ...prev, code: "", timeRemaining: 300 }));
    
    // Restart timer
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    toast({
      title: "Code Resent",
      description: `New verification code sent. Use: 123456`
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-blue to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Welcome to BuildwiseAI
          </h1>
          <p className="text-neutral-600">
            Secure login with verification code
          </p>
        </div>

        <Card className="shadow-xl">
          {/* Method Selection Step */}
          {state.step === "method" && (
            <>
              <CardHeader>
                <CardTitle>Choose Login Method</CardTitle>
                <CardDescription>
                  We'll send you a secure verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant={state.method === "email" ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleMethodSelect("email")}
                    className="h-auto p-6 flex items-center justify-start gap-4"
                    data-testid="method-email"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Email Verification</p>
                      <p className="text-sm text-neutral-600">Get code via email</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant={state.method === "phone" ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleMethodSelect("phone")}
                    className="h-auto p-6 flex items-center justify-start gap-4"
                    data-testid="method-phone"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">SMS Verification</p>
                      <p className="text-sm text-neutral-600">Get code via text</p>
                    </div>
                  </Button>
                </div>

                {state.method && (
                  <form onSubmit={handleSendCode} className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">
                        {state.method === "email" ? "Email Address" : "Phone Number"}
                      </Label>
                      <Input
                        id="contact"
                        type={state.method === "email" ? "email" : "tel"}
                        value={state.contact}
                        onChange={(e) => setState(prev => ({ ...prev, contact: e.target.value }))}
                        placeholder={state.method === "email" ? "Enter your email" : "Enter your phone"}
                        required
                        data-testid="input-contact"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={state.isLoading}
                      className="w-full bg-brand-blue hover:bg-blue-700"
                      data-testid="button-send-code"
                    >
                      {state.isLoading ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          )}

          {/* Verification Step */}
          {state.step === "verify" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Enter Verification Code
                </CardTitle>
                <CardDescription>
                  Code sent to {state.contact} • Use: <strong>123456</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">6-Digit Code</Label>
                    <Input
                      id="code"
                      type="text"
                      value={state.code}
                      onChange={(e) => setState(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '').substring(0, 6) }))}
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-2xl font-mono tracking-widest"
                      data-testid="input-code"
                    />
                  </div>
                  
                  {state.timeRemaining > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
                      <Timer className="w-4 h-4" />
                      Code expires in {formatTime(state.timeRemaining)}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={state.isLoading || state.code.length !== 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-verify"
                  >
                    {state.isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                </form>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, step: "method", code: "", timeRemaining: 0 }))}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  
                  {state.timeRemaining === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendCode}
                      data-testid="button-resend"
                    >
                      Resend Code
                    </Button>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* Success Step */}
          {state.step === "success" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                  Login Successful!
                </CardTitle>
                <CardDescription>
                  Redirecting to your dashboard...
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-neutral-600 mb-4">
                  Welcome to BuildwiseAI! You'll be redirected shortly.
                </p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-continue"
                >
                  Continue to Dashboard
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        {/* Demo Info */}
        {state.step === "verify" && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">Demo Mode:</h4>
            <p className="text-sm text-amber-800">
              Use verification code <strong>123456</strong> to access the dashboard
            </p>
          </div>
        )}

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