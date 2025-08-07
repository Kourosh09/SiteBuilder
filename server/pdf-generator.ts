// PDF Report Generator for BuildwiseAI Zoning Analysis
import { jsPDF } from 'jspdf';

export interface ZoningReportData {
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  lotSize: number;
  frontage: number;
  analysisDate: string;
  zoning: {
    zoningCode: string;
    description: string;
    maxHeight: number;
    maxFAR: number;
    maxDensity: number;
    permittedUses: string[];
    setbacks: {
      front: number;
      rear: number;
      side: number;
    };
    parkingRequirements: string;
  };
  developmentPotential: {
    maxUnits: number;
    bill44MaxUnits: number;
    bill47MaxUnits: number;
    todMaxUnits: number;
    combinedMaxUnits: number;
    recommendedUnits: number;
    suggestedUnitMix: { bedrooms: number; count: number }[];
    buildingType: string;
    estimatedGFA: number;
    estimatedValue: number;
    feasibilityScore: number;
    constraints: string[];
    opportunities: string[];
    bill44Compliance: {
      eligible: boolean;
      benefits: string[];
      requirements: string[];
      incentives: string[];
    };
    bill47Compliance: {
      eligible: boolean;
      benefits: string[];
      requirements: string[];
      incentives: string[];
    };
    todCompliance: {
      eligible: boolean;
      benefits: string[];
      requirements: string[];
      incentives: string[];
    };
  };
  marketContext?: {
    averageHomePrices: number;
    constructionCosts: number;
    saleVelocity: string;
    demographics: string;
  };
  nearbyAmenities?: {
    transit: { type: string; distance: number }[];
    schools: { name: string; rating: number; distance: number }[];
    shopping: { name: string; type: string; distance: number }[];
  };
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  generateZoningReport(data: ZoningReportData): Buffer {
    this.addHeader(data);
    this.addPropertySummary(data);
    this.addZoningInformation(data);
    this.addDevelopmentPotential(data);
    this.addPolicyAnalysis(data);
    this.addFinancialOverview(data);
    this.addRecommendations(data);
    this.addFooter();

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  private addHeader(data: ZoningReportData): void {
    // BuildwiseAI Logo and Header
    this.doc.setFillColor(13, 110, 253); // Brand blue
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BuildwiseAI', this.margin, 25);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Zoning Intelligence & Development Analysis Report', this.margin, 35);

    // Property Address
    this.currentY = 55;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${data.address}, ${data.city}`, this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Analysis Date: ${data.analysisDate}`, this.margin, this.currentY);
    
    this.currentY += 20;
    this.addSeparator();
  }

  private addPropertySummary(data: ZoningReportData): void {
    this.addSectionTitle('Property Summary');
    
    const summaryData = [
      ['Property Address:', `${data.address}, ${data.city}`],
      ['Lot Size:', `${data.lotSize.toLocaleString()} sq ft`],
      ['Frontage:', `${data.frontage} ft`],
      ['Coordinates:', `${data.coordinates.lat.toFixed(6)}, ${data.coordinates.lng.toFixed(6)}`],
      ['Zoning Code:', data.zoning.zoningCode],
      ['Zoning Description:', data.zoning.description]
    ];

    this.addTable(summaryData, 2);
    this.currentY += 15;
  }

  private addZoningInformation(data: ZoningReportData): void {
    this.addSectionTitle('Zoning Regulations');
    
    const zoningData = [
      ['Maximum Height:', `${data.zoning.maxHeight}m`],
      ['Maximum FAR:', data.zoning.maxFAR.toString()],
      ['Maximum Density:', `${data.zoning.maxDensity} units`],
      ['Front Setback:', `${data.zoning.setbacks.front}m`],
      ['Side Setback:', `${data.zoning.setbacks.side}m`],
      ['Rear Setback:', `${data.zoning.setbacks.rear}m`],
      ['Parking Requirements:', data.zoning.parkingRequirements]
    ];

    this.addTable(zoningData, 2);
    
    // Permitted Uses
    this.currentY += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Permitted Uses:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    data.zoning.permittedUses.forEach(use => {
      this.doc.text(`• ${use}`, this.margin + 10, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 10;
  }

  private addDevelopmentPotential(data: ZoningReportData): void {
    this.addSectionTitle('Development Potential Analysis');
    
    // Unit Potential Comparison
    const unitData = [
      ['Traditional Zoning:', `${data.developmentPotential.maxUnits} units`],
      ['Bill 44 Potential:', `${data.developmentPotential.bill44MaxUnits} units`],
      ['Bill 47 Potential:', `${data.developmentPotential.bill47MaxUnits} units`],
      ['TOD Bonus:', `+${data.developmentPotential.todMaxUnits} units`],
      ['Combined Maximum:', `${data.developmentPotential.combinedMaxUnits} units`],
      ['Recommended:', `${data.developmentPotential.recommendedUnits} units`]
    ];

    this.addTable(unitData, 2);
    
    // Development Details
    this.currentY += 10;
    const detailsData = [
      ['Building Type:', data.developmentPotential.buildingType],
      ['Estimated GFA:', `${data.developmentPotential.estimatedGFA.toLocaleString()} sq ft`],
      ['Estimated Value:', `$${data.developmentPotential.estimatedValue.toLocaleString()}`],
      ['Feasibility Score:', `${data.developmentPotential.feasibilityScore}/100`]
    ];

    this.addTable(detailsData, 2);
    
    // Unit Mix
    this.currentY += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Suggested Unit Mix:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    data.developmentPotential.suggestedUnitMix.forEach(unit => {
      this.doc.text(`• ${unit.count}x ${unit.bedrooms}-bedroom units`, this.margin + 10, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }

  private addPolicyAnalysis(data: ZoningReportData): void {
    this.checkPageSpace(100);
    this.addSectionTitle('Housing Policy Analysis');
    
    // Bill 44 Analysis
    this.addPolicySection('Bill 44 (Multiplex Development)', data.developmentPotential.bill44Compliance, '#0d6efd');
    
    // Bill 47 Analysis  
    this.addPolicySection('Bill 47 (Secondary Suites & ADUs)', data.developmentPotential.bill47Compliance, '#198754');
    
    // TOD Analysis
    this.addPolicySection('TOD (Transit-Oriented Development)', data.developmentPotential.todCompliance, '#6f42c1');
  }

  private addPolicySection(title: string, compliance: any, color: string): void {
    this.checkPageSpace(60);
    
    // Policy title with colored background
    const rgb = this.hexToRgb(color);
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text(title, this.margin + 2, this.currentY + 4);
    
    this.currentY += 12;
    this.doc.setTextColor(0, 0, 0);
    
    // Eligibility status
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Status: ${compliance.eligible ? '✓ Eligible' : '✗ Not Eligible'}`, this.margin, this.currentY);
    this.currentY += 10;
    
    // Benefits
    if (compliance.benefits.length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Benefits:', this.margin, this.currentY);
      this.currentY += 6;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      compliance.benefits.forEach((benefit: string) => {
        const lines = this.wrapText(benefit, this.pageWidth - 2 * this.margin - 20);
        lines.forEach(line => {
          this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
          this.currentY += 5;
        });
      });
      this.currentY += 5;
    }
    
    this.doc.setFontSize(12);
  }

  private addFinancialOverview(data: ZoningReportData): void {
    this.checkPageSpace(80);
    this.addSectionTitle('Financial Overview');
    
    if (data.marketContext) {
      const financialData = [
        ['Average Home Prices:', `$${data.marketContext.averageHomePrices.toLocaleString()}`],
        ['Construction Costs:', `$${data.marketContext.constructionCosts}/sq ft`],
        ['Sale Velocity:', data.marketContext.saleVelocity],
        ['Target Demographics:', data.marketContext.demographics]
      ];
      
      this.addTable(financialData, 2);
    }
    
    this.currentY += 15;
  }

  private addRecommendations(data: ZoningReportData): void {
    this.checkPageSpace(100);
    this.addSectionTitle('Development Recommendations');
    
    // Opportunities
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Opportunities:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    data.developmentPotential.opportunities.forEach(opportunity => {
      const lines = this.wrapText(opportunity, this.pageWidth - 2 * this.margin - 20);
      lines.forEach(line => {
        this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
        this.currentY += 5;
      });
    });
    
    this.currentY += 10;
    
    // Constraints
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Constraints:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    data.developmentPotential.constraints.forEach(constraint => {
      const lines = this.wrapText(constraint, this.pageWidth - 2 * this.margin - 20);
      lines.forEach(line => {
        this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
        this.currentY += 5;
      });
    });
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 20;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 128, 128);
    
    const pageNumber = this.doc.internal.pages ? this.doc.internal.pages.length - 1 : 1;
    const footerText = `Generated by BuildwiseAI - Real Estate Development Intelligence Platform | buildwiseai.ca | Page ${pageNumber}`;
    this.doc.text(footerText, this.pageWidth / 2, footerY, { align: 'center' });
    
    // Disclaimer
    const disclaimer = 'This report is for informational purposes only. Consult with local authorities and professionals before making development decisions.';
    this.doc.text(disclaimer, this.pageWidth / 2, footerY + 8, { align: 'center' });
  }

  private addSectionTitle(title: string): void {
    this.checkPageSpace(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(13, 110, 253);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 12;
    this.addSeparator();
    this.doc.setTextColor(0, 0, 0);
  }

  private addSeparator(): void {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  private addTable(data: string[][], columns: number): void {
    const colWidth = (this.pageWidth - 2 * this.margin) / columns;
    
    data.forEach(row => {
      this.checkPageSpace(8);
      row.forEach((cell, index) => {
        const x = this.margin + (index * colWidth);
        if (index === 0) {
          this.doc.setFont('helvetica', 'bold');
        } else {
          this.doc.setFont('helvetica', 'normal');
        }
        this.doc.text(cell, x, this.currentY);
      });
      this.currentY += 8;
    });
  }

  private checkPageSpace(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = this.doc.getTextWidth(testLine);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}