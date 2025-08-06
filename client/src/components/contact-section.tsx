import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertLead } from "@shared/schema";

export default function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    source: "",
    message: "",
    newsletter: false
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: InsertLead) => {
      return await apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your interest!",
        description: "We'll be in touch soon to discuss how BuildwiseAI can help your business.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        role: "",
        source: "",
        message: "",
        newsletter: false
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const leadData: InsertLead = {
      ...formData,
      newsletter: formData.newsletter ? "true" : "false"
    };

    createLeadMutation.mutate(leadData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">
              Ready to Transform Your Development Finance?
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Join the waitlist for early access to BuildwiseAI and be among the first to experience the future of real estate development finance.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-blue bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                  <p className="text-neutral-600" data-testid="text-contact-email">hello@buildwiseai.ca</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-blue bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Phone</h3>
                  <p className="text-neutral-600" data-testid="text-contact-phone">+1 (604) 555-0123</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-blue bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Location</h3>
                  <p className="text-neutral-600" data-testid="text-contact-location">Vancouver, BC, Canada</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-6">Get Early Access</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700 mb-2">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-neutral-700 mb-2">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Smith"
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700 mb-2">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-sm font-medium text-neutral-700 mb-2">
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="ABC Development Corp"
                  data-testid="input-company"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-sm font-medium text-neutral-700 mb-2">
                  Role *
                </Label>
                <Select required value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Real Estate Developer</SelectItem>
                    <SelectItem value="builder">Licensed Builder</SelectItem>
                    <SelectItem value="investor">Real Estate Investor</SelectItem>
                    <SelectItem value="realtor">Realtor/Agent</SelectItem>
                    <SelectItem value="consultant">Financial Consultant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source" className="text-sm font-medium text-neutral-700 mb-2">
                  How did you hear about us?
                </Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                  <SelectTrigger data-testid="select-source">
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="event">Industry Event</SelectItem>
                    <SelectItem value="search">Search Engine</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-neutral-700 mb-2">
                  Message
                </Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Tell us about your development projects and how BuildwiseAI can help..."
                  data-testid="textarea-message"
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => handleInputChange("newsletter", !!checked)}
                  data-testid="checkbox-newsletter"
                />
                <Label htmlFor="newsletter" className="text-sm text-neutral-600">
                  I'd like to receive updates about BuildwiseAI features and industry insights
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-blue text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                disabled={createLeadMutation.isPending}
                data-testid="button-join-waitlist"
              >
                {createLeadMutation.isPending ? "Submitting..." : "Join Waitlist"}
              </Button>

              <p className="text-xs text-neutral-500 text-center">
                By submitting this form, you agree to our{" "}
                <a href="#" className="text-brand-blue hover:underline">Privacy Policy</a>{" "}
                and{" "}
                <a href="#" className="text-brand-blue hover:underline">Terms of Service</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
