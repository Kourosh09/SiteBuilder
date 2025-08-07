// Lead Generation & Social Media Automation for BuildwiseAI
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface LeadCaptureData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyAddress?: string;
  city?: string;
  projectInterest: 'sell' | 'jv' | 'finance' | 'develop' | 'invest';
  leadType: 'landowner' | 'developer' | 'investor' | 'realtor';
  message?: string;
  source: string;
  createdAt: Date;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  tags: string[];
}

export interface SocialMediaPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  content: string;
  hashtags: string[];
  imagePrompt?: string;
  scheduledFor?: Date;
  posted: boolean;
  category: 'market_insight' | 'builder_tip' | 'investment_advice' | 'project_showcase';
}

export interface AdCopyResult {
  headline: string;
  bodyContent: string;
  callToAction: string;
  hashtags: string[];
  targetAudience: string;
}

export interface LandingPageConfig {
  realtorName: string;
  company: string;
  phone: string;
  email: string;
  specialization: string;
  testimonials: string[];
  primaryOffer: string;
  logoUrl?: string;
  headshotUrl?: string;
}

export class LeadGenerationService {
  private leads: LeadCaptureData[] = [];
  private posts: SocialMediaPost[] = [];

  /**
   * Capture and store lead information
   */
  async captureLead(leadData: Omit<LeadCaptureData, 'id' | 'createdAt' | 'status' | 'tags'>): Promise<LeadCaptureData> {
    const lead: LeadCaptureData = {
      ...leadData,
      id: this.generateId(),
      createdAt: new Date(),
      status: 'new',
      tags: this.autoTagLead(leadData)
    };

    this.leads.push(lead);
    
    // Auto-score and prioritize lead
    await this.scoreLead(lead);
    
    return lead;
  }

  /**
   * Generate AI-powered social media content
   */
  async generateSocialContent(
    category: SocialMediaPost['category'],
    platform: SocialMediaPost['platform'],
    topic?: string
  ): Promise<SocialMediaPost> {
    try {
      const prompt = this.buildContentPrompt(category, platform, topic);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a real estate marketing expert specializing in content for builders, developers, and investors. Create engaging, professional social media content that drives engagement and leads."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      
      const post: SocialMediaPost = {
        id: this.generateId(),
        platform,
        content: result.content,
        hashtags: result.hashtags || [],
        imagePrompt: result.imagePrompt,
        posted: false,
        category
      };

      this.posts.push(post);
      return post;
      
    } catch (error) {
      console.error("Social content generation error:", error);
      throw new Error("Failed to generate social media content");
    }
  }

  /**
   * Generate AI-powered ad copy for Facebook/Instagram
   */
  async generateAdCopy(
    targetAudience: string,
    offer: string,
    propertyType?: string,
    location?: string
  ): Promise<AdCopyResult> {
    try {
      const prompt = `Create compelling Facebook/Instagram ad copy for real estate.
      
      Target Audience: ${targetAudience}
      Offer: ${offer}
      ${propertyType ? `Property Type: ${propertyType}` : ''}
      ${location ? `Location: ${location}` : ''}
      
      Generate ad copy with headline, body content, call-to-action, and hashtags. 
      Make it conversion-focused and engaging. Respond in JSON format with keys: headline, bodyContent, callToAction, hashtags (array).`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a digital marketing expert specializing in real estate advertising. Create high-converting ad copy that follows Facebook's advertising policies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      
      return {
        headline: result.headline,
        bodyContent: result.bodyContent,
        callToAction: result.callToAction,
        hashtags: result.hashtags || [],
        targetAudience
      };
      
    } catch (error) {
      console.error("Ad copy generation error:", error);
      throw new Error("Failed to generate ad copy");
    }
  }

  /**
   * Get all leads with filtering
   */
  getLeads(filters?: {
    status?: LeadCaptureData['status'];
    leadType?: LeadCaptureData['leadType'];
    projectInterest?: LeadCaptureData['projectInterest'];
  }): LeadCaptureData[] {
    let filteredLeads = [...this.leads];

    if (filters) {
      if (filters.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
      }
      if (filters.leadType) {
        filteredLeads = filteredLeads.filter(lead => lead.leadType === filters.leadType);
      }
      if (filters.projectInterest) {
        filteredLeads = filteredLeads.filter(lead => lead.projectInterest === filters.projectInterest);
      }
    }

    return filteredLeads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all social media posts
   */
  getSocialPosts(platform?: SocialMediaPost['platform']): SocialMediaPost[] {
    let posts = [...this.posts];
    
    if (platform) {
      posts = posts.filter(post => post.platform === platform);
    }
    
    return posts.sort((a, b) => (b.scheduledFor?.getTime() || 0) - (a.scheduledFor?.getTime() || 0));
  }

  /**
   * Update lead status
   */
  updateLeadStatus(leadId: string, status: LeadCaptureData['status'], tags?: string[]): boolean {
    const leadIndex = this.leads.findIndex(lead => lead.id === leadId);
    if (leadIndex === -1) return false;

    this.leads[leadIndex].status = status;
    if (tags) {
      const currentTags = this.leads[leadIndex].tags;
      const newTags = [...currentTags, ...tags];
      this.leads[leadIndex].tags = Array.from(new Set(newTags));
    }

    return true;
  }

  /**
   * Generate landing page configuration
   */
  async generateLandingPage(config: LandingPageConfig): Promise<string> {
    try {
      const prompt = `Create a high-converting landing page HTML for a real estate professional:
      
      Name: ${config.realtorName}
      Company: ${config.company}
      Specialization: ${config.specialization}
      Primary Offer: ${config.primaryOffer}
      Contact: ${config.email}, ${config.phone}
      
      Create modern, conversion-focused HTML with inline CSS. Include:
      - Hero section with offer
      - Benefits/features
      - Testimonials
      - Contact form
      - Professional styling
      
      Return just the HTML code.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a web developer and conversion optimization expert. Create high-converting landing pages for real estate professionals."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return response.choices[0].message.content!;
      
    } catch (error) {
      console.error("Landing page generation error:", error);
      throw new Error("Failed to generate landing page");
    }
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private autoTagLead(leadData: Omit<LeadCaptureData, 'id' | 'createdAt' | 'status' | 'tags'>): string[] {
    const tags: string[] = [];

    // Auto-tag based on lead data
    if (leadData.propertyAddress) tags.push('has-property');
    if (leadData.projectInterest === 'jv') tags.push('jv-opportunity');
    if (leadData.leadType === 'landowner') tags.push('potential-seller');
    if (leadData.message && leadData.message.toLowerCase().includes('urgent')) tags.push('urgent');
    
    // Location-based tags
    if (leadData.city) {
      const lowerCity = leadData.city.toLowerCase();
      if (['vancouver', 'burnaby', 'richmond'].includes(lowerCity)) {
        tags.push('high-value-market');
      }
    }

    return tags;
  }

  private async scoreLead(lead: LeadCaptureData): Promise<void> {
    // Simple lead scoring logic
    let score = 0;

    if (lead.propertyAddress) score += 20;
    if (lead.phone) score += 15;
    if (lead.projectInterest === 'jv') score += 25;
    if (lead.leadType === 'landowner') score += 20;
    if (lead.message && lead.message.length > 50) score += 10;

    // Add high-score tag for priority leads
    if (score >= 50) {
      lead.tags.push('high-priority');
    }
  }

  private buildContentPrompt(
    category: SocialMediaPost['category'],
    platform: SocialMediaPost['platform'],
    topic?: string
  ): string {
    const platformSpecs = {
      instagram: "Instagram format with engaging visuals and hashtags",
      facebook: "Facebook format with longer descriptions and community focus",
      linkedin: "LinkedIn professional format for business networking",
      twitter: "Twitter format with concise, punchy content under 280 characters"
    };

    const categoryTemplates = {
      market_insight: "Share valuable market insights and trends for real estate developers",
      builder_tip: "Provide practical construction and development tips",
      investment_advice: "Offer real estate investment strategies and opportunities",
      project_showcase: "Showcase development projects and success stories"
    };

    return `Create ${platformSpecs[platform]} content about ${categoryTemplates[category]}.
    ${topic ? `Focus on: ${topic}` : ''}
    
    Include engaging content that builds authority and drives leads.
    Return JSON with: content, hashtags (array), imagePrompt (optional).`;
  }
}

export const leadGenerationService = new LeadGenerationService();