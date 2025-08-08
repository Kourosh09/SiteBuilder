import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LoginState {
  step: "method" | "verify" | "success";
  method: "email" | "phone" | null;
  contact: string;
  code: string;
  isLoading: boolean;
  timeRemaining: number;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { toast } = useToast();
  const [state, setState] = useState<LoginState>({
    step: "method",
    method: null,
    contact: "",
    code: "",
    isLoading: false,
    timeRemaining: 0
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setState({
        step: "method",
        method: null,
        contact: "",
        code: "",
        isLoading: false,
        timeRemaining: 0
      });
    }
  }, [isOpen]);

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

      // Call success callback after a brief delay
      setTimeout(() => {
        onSuccess();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Welcome to BuildwiseAI
          </DialogTitle>
          <DialogDescription>
            Secure login with verification code
          </DialogDescription>
        </DialogHeader>

        {/* Method Selection Step */}
        {state.step === "method" && (
          <div className="space-y-4">
            <div className="text-sm text-neutral-600 mb-4">
              Choose how you'd like to receive your verification code:
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={state.method === "email" ? "default" : "outline"}
                size="lg"
                onClick={() => handleMethodSelect("email")}
                className="h-auto p-4 flex items-center justify-start gap-3"
                data-testid="method-email"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
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
                className="h-auto p-4 flex items-center justify-start gap-3"
                data-testid="method-phone"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-send-code"
                >
                  {state.isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Verification Step */}
        {state.step === "verify" && (
          <div className="space-y-4">
            <div className="text-center">
              <Timer className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-neutral-600">
                Code sent to {state.contact} • Use: <strong>123456</strong>
              </p>
            </div>
            
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

            {/* Demo Info */}
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Demo Mode:</strong> Use verification code <strong>123456</strong>
              </p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {state.step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-emerald-600 mb-2">Login Successful!</h3>
            <p className="text-neutral-600 mb-4">
              Welcome to BuildwiseAI! Loading your dashboard...
            </p>
            <Button
              onClick={onSuccess}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-continue"
            >
              Continue to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}