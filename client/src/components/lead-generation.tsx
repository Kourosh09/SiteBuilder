import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  PenTool, 
  Share2, 
  Target, 
  Loader2,
  CheckCircle,
  Copy,
  Globe,
  MessageSquare,
  TrendingUp,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdCopyResult {
  headline: string;
  bodyContent: string;
  callToAction: string;
  hashtags: string[];
  targetAudience: string;
}

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  content: string;
  hashtags: string[];
  imagePrompt?: string;
  category: 'market_insight' | 'builder_tip' | 'investment_advice' | 'project_showcase';
}

interface LeadCaptureData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyAddress?: string;
  city?: string;
  projectInterest: 'sell' | 'jv' | 'finance' | 'develop' | 'invest';
  leadType: 'landowner' | 'developer' | 'investor' | 'realtor';
  message?: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  tags: string[];
  createdAt: Date;
}

export default function LeadGeneration() {
  const [loading, setLoading] = useState(false);
  const [adCopy, setAdCopy] = useState<AdCopyResult | null>(null);
  const [socialPost, setSocialPost] = useState<SocialPost | null>(null);
  const [leads, setLeads] = useState<LeadCaptureData[]>([]);
  const [landingPageHtml, setLandingPageHtml] = useState<string>("");
  const { toast } = useToast();

  // Ad Copy Generation
  const [adForm, setAdForm] = useState({
    targetAudience: "",
    offer: "",
    propertyType: "",
    location: ""
  });

  // Social Media Generation
  const [socialForm, setSocialForm] = useState({
    category: "" as 'market_insight' | 'builder_tip' | 'investment_advice' | 'project_showcase',
    platform: "" as 'instagram' | 'facebook' | 'linkedin' | 'twitter',
    topic: ""
  });

  // Lead Capture Form
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    propertyAddress: "",
    city: "",
    projectInterest: "" as 'sell' | 'jv' | 'finance' | 'develop' | 'invest',
    leadType: "" as 'landowner' | 'developer' | 'investor' | 'realtor',
    message: ""
  });

  // Landing Page Form
  const [landingForm, setLandingForm] = useState({
    realtorName: "",
    company: "",
    phone: "",
    email: "",
    specialization: "",
    primaryOffer: ""
  });

  const handleGenerateAdCopy = async () => {
    if (!adForm.targetAudience || !adForm.offer) {
      toast({
        title: "Missing Information",
        description: "Please enter target audience and offer.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/advertising/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adForm)
      });

      const result = await response.json();

      if (result.success) {
        setAdCopy(result.data);
        toast({
          title: "Ad Copy Generated",
          description: "Your Facebook/Instagram ad copy is ready!"
        });
      } else {
        throw new Error(result.error || "Failed to generate ad copy");
      }
    } catch (error) {
      console.error("Ad copy generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate ad copy.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSocialContent = async () => {
    if (!socialForm.category || !socialForm.platform) {
      toast({
        title: "Missing Information",
        description: "Please select category and platform.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialForm)
      });

      const result = await response.json();

      if (result.success) {
        setSocialPost(result.data);
        toast({
          title: "Social Content Generated",
          description: "Your social media post is ready!"
        });
      } else {
        throw new Error(result.error || "Failed to generate social content");
      }
    } catch (error) {
      console.error("Social content generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate social content.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureLead = async () => {
    if (!leadForm.name || !leadForm.email || !leadForm.projectInterest || !leadForm.leadType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm)
      });

      const result = await response.json();

      if (result.success) {
        setLeads([result.data, ...leads]);
        setLeadForm({
          name: "",
          email: "",
          phone: "",
          propertyAddress: "",
          city: "",
          projectInterest: "" as any,
          leadType: "" as any,
          message: ""
        });
        toast({
          title: "Lead Captured",
          description: "Lead information saved successfully!"
        });
      } else {
        throw new Error(result.error || "Failed to capture lead");
      }
    } catch (error) {
      console.error("Lead capture error:", error);
      toast({
        title: "Capture Failed",
        description: error instanceof Error ? error.message : "Unable to capture lead.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLandingPage = async () => {
    if (!landingForm.realtorName || !landingForm.company || !landingForm.primaryOffer) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/marketing/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landingForm)
      });

      const result = await response.json();

      if (result.success) {
        setLandingPageHtml(result.data.html);
        toast({
          title: "Landing Page Generated",
          description: "Your custom landing page is ready!"
        });
      } else {
        throw new Error(result.error || "Failed to generate landing page");
      }
    } catch (error) {
      console.error("Landing page generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate landing page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard!"
    });
  };

  return (
    <section id="lead-generation" className="py-20 bg-gradient-to-br from-blue-50 to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>Lead Generation & Marketing Automation</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Automated Marketing Suite
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Generate leads, create social content, and build landing pages with AI-powered marketing tools
          </p>
        </div>

        <Tabs defaultValue="ad-copy" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="ad-copy" data-testid="tab-ad-copy">Ad Copy</TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social">Social Media</TabsTrigger>
            <TabsTrigger value="leads" data-testid="tab-leads">Lead Capture</TabsTrigger>
            <TabsTrigger value="landing" data-testid="tab-landing">Landing Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="ad-copy" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-blue" />
                    Facebook/Instagram Ad Generator
                  </CardTitle>
                  <CardDescription>
                    Generate high-converting ad copy for your real estate campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="target-audience">Target Audience *</Label>
                    <Input
                      id="target-audience"
                      placeholder="First-time homebuyers in Vancouver"
                      value={adForm.targetAudience}
                      onChange={(e) => setAdForm({...adForm, targetAudience: e.target.value})}
                      data-testid="input-target-audience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer">Offer/Value Proposition *</Label>
                    <Input
                      id="offer"
                      placeholder="Free property valuation and development consultation"
                      value={adForm.offer}
                      onChange={(e) => setAdForm({...adForm, offer: e.target.value})}
                      data-testid="input-offer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property-type">Property Type</Label>
                      <Input
                        id="property-type"
                        placeholder="Single-family homes"
                        value={adForm.propertyType}
                        onChange={(e) => setAdForm({...adForm, propertyType: e.target.value})}
                        data-testid="input-property-type"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad-location">Location</Label>
                      <Input
                        id="ad-location"
                        placeholder="Greater Vancouver Area"
                        value={adForm.location}
                        onChange={(e) => setAdForm({...adForm, location: e.target.value})}
                        data-testid="input-ad-location"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateAdCopy}
                    disabled={loading}
                    className="w-full bg-brand-blue hover:bg-brand-blue/90"
                    size="lg"
                    data-testid="button-generate-ad-copy"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Ad Copy...
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4 mr-2" />
                        Generate Ad Copy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {adCopy && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Generated Ad Copy</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${adCopy.headline}\n\n${adCopy.bodyContent}\n\n${adCopy.callToAction}\n\n${adCopy.hashtags.join(' ')}`)}
                        data-testid="button-copy-ad-copy"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Headline</Label>
                      <p className="font-semibold text-lg text-brand-blue" data-testid="text-ad-headline">
                        {adCopy.headline}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Body Content</Label>
                      <p className="text-neutral-700 leading-relaxed" data-testid="text-ad-body">
                        {adCopy.bodyContent}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Call to Action</Label>
                      <p className="font-medium text-emerald-600" data-testid="text-ad-cta">
                        {adCopy.callToAction}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Hashtags</Label>
                      <div className="flex flex-wrap gap-2">
                        {adCopy.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary" data-testid={`badge-hashtag-${index}`}>
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-brand-blue" />
                    Social Media Content Generator
                  </CardTitle>
                  <CardDescription>
                    Create engaging social media posts for your real estate business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Content Category *</Label>
                    <Select
                      value={socialForm.category}
                      onValueChange={(value: any) => setSocialForm({...socialForm, category: value})}
                    >
                      <SelectTrigger data-testid="select-social-category">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market_insight">Market Insights</SelectItem>
                        <SelectItem value="builder_tip">Builder Tips</SelectItem>
                        <SelectItem value="investment_advice">Investment Advice</SelectItem>
                        <SelectItem value="project_showcase">Project Showcase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Platform *</Label>
                    <Select
                      value={socialForm.platform}
                      onValueChange={(value: any) => setSocialForm({...socialForm, platform: value})}
                    >
                      <SelectTrigger data-testid="select-social-platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social-topic">Specific Topic (Optional)</Label>
                    <Input
                      id="social-topic"
                      placeholder="Vancouver housing market trends"
                      value={socialForm.topic}
                      onChange={(e) => setSocialForm({...socialForm, topic: e.target.value})}
                      data-testid="input-social-topic"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateSocialContent}
                    disabled={loading}
                    className="w-full bg-brand-blue hover:bg-brand-blue/90"
                    size="lg"
                    data-testid="button-generate-social-content"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Content...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Generate Social Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {socialPost && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Generated Social Post</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize" data-testid="badge-social-platform">
                          {socialPost.platform}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${socialPost.content}\n\n${socialPost.hashtags.join(' ')}`)}
                          data-testid="button-copy-social-post"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Post Content</Label>
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-line" data-testid="text-social-content">
                        {socialPost.content}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Hashtags</Label>
                      <div className="flex flex-wrap gap-2">
                        {socialPost.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary" data-testid={`badge-social-hashtag-${index}`}>
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {socialPost.imagePrompt && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Image Suggestion</Label>
                        <p className="text-sm text-neutral-600" data-testid="text-image-prompt">
                          {socialPost.imagePrompt}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-blue" />
                    Lead Capture Form
                  </CardTitle>
                  <CardDescription>
                    Capture and manage leads from your marketing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lead-name">Name *</Label>
                      <Input
                        id="lead-name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                        data-testid="input-lead-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-email">Email *</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                        data-testid="input-lead-email"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lead-phone">Phone</Label>
                      <Input
                        id="lead-phone"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                        data-testid="input-lead-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-city">City</Label>
                      <Input
                        id="lead-city"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({...leadForm, city: e.target.value})}
                        data-testid="input-lead-city"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-property">Property Address</Label>
                    <Input
                      id="lead-property"
                      placeholder="123 Main Street"
                      value={leadForm.propertyAddress}
                      onChange={(e) => setLeadForm({...leadForm, propertyAddress: e.target.value})}
                      data-testid="input-lead-property"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Interest *</Label>
                      <Select
                        value={leadForm.projectInterest}
                        onValueChange={(value: any) => setLeadForm({...leadForm, projectInterest: value})}
                      >
                        <SelectTrigger data-testid="select-project-interest">
                          <SelectValue placeholder="Select interest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sell">Sell Property</SelectItem>
                          <SelectItem value="jv">Joint Venture</SelectItem>
                          <SelectItem value="finance">Financing</SelectItem>
                          <SelectItem value="develop">Development</SelectItem>
                          <SelectItem value="invest">Investment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lead Type *</Label>
                      <Select
                        value={leadForm.leadType}
                        onValueChange={(value: any) => setLeadForm({...leadForm, leadType: value})}
                      >
                        <SelectTrigger data-testid="select-lead-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landowner">Land Owner</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                          <SelectItem value="realtor">Realtor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-message">Message</Label>
                    <Textarea
                      id="lead-message"
                      placeholder="Additional details or questions..."
                      value={leadForm.message}
                      onChange={(e) => setLeadForm({...leadForm, message: e.target.value})}
                      data-testid="textarea-lead-message"
                    />
                  </div>
                  <Button
                    onClick={handleCaptureLead}
                    disabled={loading}
                    className="w-full bg-brand-blue hover:bg-brand-blue/90"
                    size="lg"
                    data-testid="button-capture-lead"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Capturing Lead...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Capture Lead
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {leads.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                    <CardDescription>
                      Latest captured leads from your campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {leads.slice(0, 5).map((lead, index) => (
                      <div key={lead.id} className="p-4 border rounded-lg space-y-2" data-testid={`lead-item-${index}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold" data-testid={`lead-name-${index}`}>{lead.name}</p>
                          <Badge 
                            variant={lead.status === 'new' ? 'default' : 'secondary'}
                            data-testid={`lead-status-${index}`}
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600" data-testid={`lead-email-${index}`}>
                          {lead.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" data-testid={`lead-type-${index}`}>
                            {lead.leadType}
                          </Badge>
                          <Badge variant="outline" data-testid={`lead-interest-${index}`}>
                            {lead.projectInterest}
                          </Badge>
                        </div>
                        {lead.tags.length > 0 && (
                          <div className="flex gap-1">
                            {lead.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" data-testid={`lead-tag-${index}-${tagIndex}`}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="landing" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-blue" />
                    Landing Page Generator
                  </CardTitle>
                  <CardDescription>
                    Create custom landing pages for your real estate campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="realtor-name">Name *</Label>
                      <Input
                        id="realtor-name"
                        value={landingForm.realtorName}
                        onChange={(e) => setLandingForm({...landingForm, realtorName: e.target.value})}
                        data-testid="input-realtor-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={landingForm.company}
                        onChange={(e) => setLandingForm({...landingForm, company: e.target.value})}
                        data-testid="input-company"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landing-phone">Phone</Label>
                      <Input
                        id="landing-phone"
                        value={landingForm.phone}
                        onChange={(e) => setLandingForm({...landingForm, phone: e.target.value})}
                        data-testid="input-landing-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landing-email">Email</Label>
                      <Input
                        id="landing-email"
                        type="email"
                        value={landingForm.email}
                        onChange={(e) => setLandingForm({...landingForm, email: e.target.value})}
                        data-testid="input-landing-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="Luxury homes, First-time buyers, Investment properties"
                      value={landingForm.specialization}
                      onChange={(e) => setLandingForm({...landingForm, specialization: e.target.value})}
                      data-testid="input-specialization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary-offer">Primary Offer *</Label>
                    <Input
                      id="primary-offer"
                      placeholder="Free Home Valuation & Market Analysis"
                      value={landingForm.primaryOffer}
                      onChange={(e) => setLandingForm({...landingForm, primaryOffer: e.target.value})}
                      data-testid="input-primary-offer"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateLandingPage}
                    disabled={loading}
                    className="w-full bg-brand-blue hover:bg-brand-blue/90"
                    size="lg"
                    data-testid="button-generate-landing-page"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Landing Page...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Generate Landing Page
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {landingPageHtml && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Generated Landing Page</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(landingPageHtml)}
                        data-testid="button-copy-landing-page"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-neutral-600">
                        Your custom landing page HTML has been generated. Copy the code below and save it as an HTML file.
                      </p>
                      <div className="bg-neutral-50 p-4 rounded-lg max-h-96 overflow-auto">
                        <pre className="text-xs text-neutral-700 whitespace-pre-wrap" data-testid="text-landing-page-html">
                          {landingPageHtml.substring(0, 500)}...
                        </pre>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Landing page ready to deploy!</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}