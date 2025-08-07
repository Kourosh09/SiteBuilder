import { useState } from "react";
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

    // Basic validation
    if (state.method === "email" && !state.contact.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    if (state.method === "phone" && !/^\+?[\d\s\-\(\)]{10,}$/.test(state.contact)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: state.method,
          contact: state.contact
        })
      });

      const data = await response.json();

      if (data.success) {
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
          description: `Verification code sent to your ${state.method === "email" ? "email" : "phone"}.`
        });
      } else {
        throw new Error(data.error || "Failed to send code");
      }
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

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: state.method,
          contact: state.contact,
          code: state.code
        })
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({ ...prev, step: "success", isLoading: false }));
        
        toast({
          title: "Login Successful!",
          description: "Welcome to BuildwiseAI!"
        });

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        throw new Error(data.error || "Invalid verification code");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired code. Please try again.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleResendCode = async () => {
    setState(prev => ({ ...prev, code: "" }));
    await handleSendCode(new Event("submit") as any);
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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      size="lg" 
                      className="w-full"
                      disabled={state.isLoading}
                      data-testid="button-send-code"
                    >
                      {state.isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending Code...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Send Verification Code
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          )}

          {/* Code Verification Step */}
          {state.step === "verify" && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, step: "method" }))}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <CardTitle>Enter Verification Code</CardTitle>
                    <CardDescription>
                      Code sent to {state.contact}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.timeRemaining > 0 && (
                  <div className="flex items-center gap-2 text-center justify-center text-sm text-neutral-600">
                    <Timer className="w-4 h-4" />
                    <span>Code expires in {formatTime(state.timeRemaining)}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">6-Digit Code</Label>
                    <Input
                      id="code"
                      value={state.code}
                      onChange={(e) => setState(prev => ({ 
                        ...prev, 
                        code: e.target.value.replace(/\D/g, '').slice(0, 6)
                      }))}
                      placeholder="000000"
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                      data-testid="input-code"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={state.isLoading}
                    data-testid="button-verify"
                  >
                    {state.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Login
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendCode}
                      disabled={state.timeRemaining > 240 || state.isLoading} // Can resend after 1 minute
                      data-testid="button-resend"
                    >
                      Resend Code
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* Success Step */}
          {state.step === "success" && (
            <>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Login Successful!
                </h3>
                <p className="text-neutral-600 mb-4">
                  Welcome to BuildwiseAI. You're being redirected...
                </p>
                <Badge variant="secondary" className="text-sm">
                  Redirecting to dashboard...
                </Badge>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-neutral-600">
          <p>
            Secure authentication powered by BuildwiseAI
          </p>
        </div>
      </div>
    </div>
  );
}