// Sample data for contractor marketplace testing
import { contractorMarketplaceService } from './contractor-marketplace-service';

export async function createSampleContractorData() {
  try {
    console.log("Creating sample contractor marketplace data...");

    // Sample Contractors
    const sampleContractors = [
      {
        companyName: "Fraser Valley Framing Co.",
        contactName: "Mike Thompson",
        email: "mike@fraserframing.ca",
        phone: "(604) 555-0123",
        city: "Surrey",
        province: "BC",
        trades: ["Framing", "Carpentry"],
        serviceAreas: ["Surrey", "Langley", "Abbotsford", "Chilliwack"],
        yearsExperience: "15",
        description: "Specializing in residential framing with 15+ years experience. Licensed and insured.",
        rating: "4.8",
        totalJobs: "127",
        isVerified: "true",
        availabilityStatus: "Available",
        businessLicense: "BC123456",
        worksafeNumber: "WS789012",
        specializations: ["Custom homes", "Additions", "Multi-family"],
        certifications: ["Red Seal Carpenter", "Fall Protection"]
      },
      {
        companyName: "Vancouver Plumbing Solutions",
        contactName: "Sarah Chen",
        email: "sarah@vanplumbing.ca",
        phone: "(604) 555-0234",
        city: "Vancouver",
        province: "BC",
        trades: ["Plumbing", "HVAC"],
        serviceAreas: ["Vancouver", "Burnaby", "Richmond", "North Vancouver"],
        yearsExperience: "12",
        description: "Full-service plumbing and heating contractor. Emergency service available 24/7.",
        rating: "4.9",
        totalJobs: "98",
        isVerified: "true",
        availabilityStatus: "Busy",
        businessLicense: "BC234567",
        worksafeNumber: "WS890123",
        specializations: ["New construction", "Service repairs", "Hydronic heating"],
        certifications: ["Gas Fitter B", "Plumbing License"]
      },
      {
        companyName: "BC Electrical Services",
        contactName: "James Rodriguez",
        email: "james@bcelectrical.ca",
        phone: "(604) 555-0345",
        city: "Coquitlam",
        province: "BC",
        trades: ["Electrical"],
        serviceAreas: ["Coquitlam", "Port Coquitlam", "Port Moody", "Maple Ridge"],
        yearsExperience: "18",
        description: "Master electrician with experience in residential, commercial, and industrial projects.",
        rating: "4.7",
        totalJobs: "156",
        isVerified: "true",
        availabilityStatus: "Available",
        businessLicense: "BC345678",
        worksafeNumber: "WS901234",
        specializations: ["Smart home automation", "EV charging stations", "Panel upgrades"],
        certifications: ["Master Electrician", "ESA Inspector"]
      },
      {
        companyName: "Solid Foundation Works",
        contactName: "Tony Nakamura",
        email: "tony@solidfoundation.ca",
        phone: "(604) 555-0456",
        city: "Langley",
        province: "BC",
        trades: ["Foundation", "Concrete", "Excavation"],
        serviceAreas: ["Langley", "Surrey", "Mission", "Abbotsford"],
        yearsExperience: "20",
        description: "Specializing in residential foundations, concrete work, and site preparation.",
        rating: "4.6",
        totalJobs: "89",
        isVerified: "true",
        availabilityStatus: "Available",
        businessLicense: "BC456789",
        worksafeNumber: "WS012345",
        specializations: ["ICF construction", "Underpinning", "Retaining walls"],
        certifications: ["Concrete Finisher", "Excavator Operator"]
      },
      {
        companyName: "Metro Roofing Pros",
        contactName: "Lisa Williams",
        email: "lisa@metroroofing.ca",
        phone: "(604) 555-0567",
        city: "Richmond",
        province: "BC",
        trades: ["Roofing"],
        serviceAreas: ["Richmond", "Vancouver", "Delta", "Surrey"],
        yearsExperience: "10",
        description: "Professional roofing services for residential and commercial properties.",
        rating: "4.5",
        totalJobs: "73",
        isVerified: "true",
        availabilityStatus: "Busy",
        businessLicense: "BC567890",
        worksafeNumber: "WS123456",
        specializations: ["Asphalt shingles", "Metal roofing", "Flat roofs"],
        certifications: ["Roofing Contractor License", "Safety Training"]
      }
    ];

    // Sample Projects
    const sampleProjects = [
      {
        title: "Single Family Home - Framing Required",
        description: "New construction single family home in Surrey. Requiring experienced framing contractor for 2800 sq ft home. Foundation complete, ready for framing phase.",
        location: "12345 Fraser Highway",
        city: "Surrey",
        projectType: "Residential",
        tradeNeeded: "Framing",
        additionalTrades: ["Plumbing", "Electrical"],
        projectSize: "Large",
        estimatedBudget: "45000",
        timeline: "6 weeks",
        clientName: "David Park",
        clientEmail: "david.park@email.com",
        clientPhone: "(604) 555-1001",
        isUrgent: "false",
        permitRequired: "true",
        requirements: ["Red Seal certified", "WorkSafeBC coverage", "References required"]
      },
      {
        title: "Townhouse Complex - Plumbing Installation",
        description: "20-unit townhouse development requiring rough-in plumbing installation. All units are identical layout. Looking for licensed plumber with multi-unit experience.",
        location: "8900 King George Blvd",
        city: "Surrey",
        projectType: "Residential",
        tradeNeeded: "Plumbing",
        additionalTrades: ["HVAC"],
        projectSize: "Large",
        estimatedBudget: "85000",
        timeline: "10 weeks",
        clientName: "Pacific Developments Ltd",
        clientEmail: "projects@pacificdev.ca",
        clientPhone: "(604) 555-2002",
        isUrgent: "true",
        permitRequired: "true",
        requirements: ["Gas fitting license", "Multi-unit experience", "Bonded and insured"]
      },
      {
        title: "Heritage Home Restoration - Electrical Upgrade",
        description: "Complete electrical upgrade for 1920s heritage home in Vancouver. Need experienced electrician familiar with heritage requirements and modern code compliance.",
        location: "567 Cambie Street",
        city: "Vancouver",
        projectType: "Renovation",
        tradeNeeded: "Electrical",
        projectSize: "Medium",
        estimatedBudget: "25000",
        timeline: "4 weeks",
        clientName: "Jennifer Liu",
        clientEmail: "jen.liu@email.com",
        clientPhone: "(604) 555-3003",
        isUrgent: "false",
        permitRequired: "true",
        requirements: ["Heritage experience", "ESA certification", "City of Vancouver permits"]
      },
      {
        title: "Duplex Foundation Repair",
        description: "Foundation underpinning required for duplex in Burnaby. Settling issues need to be addressed. Requires experienced foundation contractor.",
        location: "4321 Kingsway",
        city: "Burnaby",
        projectType: "Renovation",
        tradeNeeded: "Foundation",
        projectSize: "Medium",
        estimatedBudget: "35000",
        timeline: "3 weeks",
        clientName: "Robert Kim",
        clientEmail: "robert.kim@email.com",
        clientPhone: "(604) 555-4004",
        isUrgent: "true",
        permitRequired: "true",
        requirements: ["Underpinning experience", "Structural engineer coordination", "Minimal disruption to tenants"]
      },
      {
        title: "Commercial Roof Replacement",
        description: "Flat roof replacement for 10,000 sq ft commercial building in Richmond. Need experienced commercial roofing contractor with TPO membrane experience.",
        location: "123 Industrial Way",
        city: "Richmond",
        projectType: "Commercial",
        tradeNeeded: "Roofing",
        projectSize: "Large",
        estimatedBudget: "65000",
        timeline: "2 weeks",
        clientName: "Richmond Properties Inc",
        clientEmail: "maintenance@richmondprops.ca",
        clientPhone: "(604) 555-5005",
        isUrgent: "false",
        permitRequired: "true",
        requirements: ["Commercial roofing license", "TPO certified installer", "Weekend work availability"]
      }
    ];

    // Create contractors
    for (const contractorData of sampleContractors) {
      try {
        await contractorMarketplaceService.createContractor(contractorData);
        console.log(`Created contractor: ${contractorData.companyName}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate key')) {
          console.log(`Contractor ${contractorData.companyName} already exists, skipping...`);
        } else {
          console.error(`Error creating contractor ${contractorData.companyName}:`, error);
        }
      }
    }

    // Create projects
    for (const projectData of sampleProjects) {
      try {
        await contractorMarketplaceService.createProject(projectData);
        console.log(`Created project: ${projectData.title}`);
      } catch (error) {
        console.error(`Error creating project ${projectData.title}:`, error);
      }
    }

    console.log("Sample contractor marketplace data created successfully!");

  } catch (error) {
    console.error("Error creating sample contractor data:", error);
    throw error;
  }
}

// Export for use in routes or startup
export { sampleContractors: [] as any[], sampleProjects: [] as any[] };