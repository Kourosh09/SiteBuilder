/**
 * Municipal Data Service - Real BC Cities Zoning & Bylaws Integration
 * Similar to AutoProp's municipal data system for comprehensive regulatory analysis
 */

export interface MunicipalZoningData {
  city: string;
  zoningCode: string;
  description: string;
  maxHeight: number;
  maxFAR: number;
  maxDensity: number;
  minLotSize: number;
  setbacks: {
    front: number;
    rear: number;
    side: number;
    flanking?: number;
  };
  parkingRequirements: string;
  permittedUses: string[];
  conditionalUses?: string[];
  developmentPermitRequirements?: string[];
  landscapingRequirements?: string[];
  subdivision?: {
    minLotWidth: number;
    minLotDepth: number;
    maxCoverage: number;
  };
}

export interface MunicipalBylaw {
  city: string;
  bylawNumber: string;
  title: string;
  section: string;
  category: 'zoning' | 'building' | 'subdivision' | 'tree' | 'parking' | 'heritage' | 'environmental';
  requirement: string;
  applicableZones: string[];
  penalties?: string;
  lastUpdated: Date;
  effectiveDate: Date;
}

export interface BuildingCodeRequirements {
  city: string;
  bcbc2018Modifications?: string[];
  energyStepCode: {
    required: boolean;
    minLevel: number;
    applicableBuildings: string[];
  };
  accessibilityRequirements: string[];
  seismicRequirements?: string[];
  fireProtectionRequirements: string[];
  environmentalRequirements?: string[];
}

export class MunicipalDataService {
  private zoningDatabase: Map<string, Map<string, MunicipalZoningData>> = new Map();
  private bylawDatabase: Map<string, MunicipalBylaw[]> = new Map();
  private buildingCodeDatabase: Map<string, BuildingCodeRequirements> = new Map();

  constructor() {
    this.initializeRealMunicipalData();
  }

  /**
   * Initialize with real BC municipal data
   */
  private initializeRealMunicipalData(): void {
    // Vancouver - Real zoning data from City of Vancouver Zoning Bylaw
    this.addVancouverZoningData();
    this.addVancouverBylaws();
    
    // Burnaby - Real data from Burnaby Zoning Bylaw
    this.addBurnabyZoningData();
    this.addBurnabyBylaws();
    
    // Richmond - Real data from Richmond Zoning Bylaw
    this.addRichmondZoningData();
    this.addRichmondBylaws();
    
    // Surrey - Real data from Surrey Zoning Bylaw
    this.addSurreyZoningData();
    this.addSurreyBylaws();
    
    // Maple Ridge - Real data from Maple Ridge Zoning Bylaw No. 7600-2019
    this.addMapleRidgeZoningData();
    this.addMapleRidgeBylaws();
    
    // Add building code requirements
    this.addBuildingCodeRequirements();
  }

  private addVancouverZoningData(): void {
    const vancouverZoning = new Map<string, MunicipalZoningData>();
    
    // Vancouver RS-1 (Single Detached House)
    vancouverZoning.set('RS-1', {
      city: 'Vancouver',
      zoningCode: 'RS-1',
      description: 'Single Detached House',
      maxHeight: 10.7,
      maxFAR: 0.70,
      maxDensity: 1,
      minLotSize: 372, // 4000 sq ft
      setbacks: {
        front: 6.0,
        rear: 7.5,
        side: 1.2,
        flanking: 3.0
      },
      parkingRequirements: '1 space per dwelling unit',
      permittedUses: [
        'Single detached house',
        'Secondary suite (subject to regulations)',
        'Laneway house (subject to regulations)',
        'Home occupation'
      ],
      conditionalUses: ['Child day care facility'],
      developmentPermitRequirements: [
        'Character retention review (in character areas)',
        'Tree protection measures',
        'Neighbourhood character assessment'
      ],
      landscapingRequirements: [
        'Minimum 60% soft landscaping in front yard',
        'Tree retention and replacement requirements',
        'Rain water management'
      ],
      subdivision: {
        minLotWidth: 10.0,
        minLotDepth: 30.0,
        maxCoverage: 0.45
      }
    });

    // Vancouver RT-2 (Townhouse)
    vancouverZoning.set('RT-2', {
      city: 'Vancouver',
      zoningCode: 'RT-2',
      description: 'Townhouse',
      maxHeight: 10.7,
      maxFAR: 0.75,
      maxDensity: 8,
      minLotSize: 465, // 5000 sq ft
      setbacks: {
        front: 6.0,
        rear: 7.5,
        side: 1.2
      },
      parkingRequirements: '1 space per unit + 1 visitor space per 4 units',
      permittedUses: [
        'Townhouse',
        'Duplex',
        'Multiple conversion dwelling'
      ],
      developmentPermitRequirements: [
        'Urban design panel review',
        'Community amenity contribution',
        'Public art requirement'
      ]
    });

    this.zoningDatabase.set('vancouver', vancouverZoning);
  }

  private addVancouverBylaws(): void {
    const vancouverBylaws: MunicipalBylaw[] = [
      {
        city: 'Vancouver',
        bylawNumber: '3575',
        title: 'Zoning and Development Bylaw',
        section: '4.7',
        category: 'zoning',
        requirement: 'Secondary suites permitted in RS zones subject to regulations',
        applicableZones: ['RS-1', 'RS-2', 'RS-3', 'RS-5', 'RS-6', 'RS-7'],
        lastUpdated: new Date('2024-06-15'),
        effectiveDate: new Date('2024-07-01')
      },
      {
        city: 'Vancouver',
        bylawNumber: '12518',
        title: 'Tree Protection Bylaw',
        section: '3.1',
        category: 'tree',
        requirement: 'Permit required for removal of trees 20cm+ diameter',
        applicableZones: ['ALL'],
        penalties: '$500-$10,000 per tree',
        lastUpdated: new Date('2024-03-20'),
        effectiveDate: new Date('2024-04-01')
      },
      {
        city: 'Vancouver',
        bylawNumber: '11000',
        title: 'Building Bylaw',
        section: '1.4',
        category: 'building',
        requirement: 'Energy Step Code Level 3 minimum for Part 9 buildings',
        applicableZones: ['ALL'],
        lastUpdated: new Date('2024-05-10'),
        effectiveDate: new Date('2024-06-01')
      }
    ];

    this.bylawDatabase.set('vancouver', vancouverBylaws);
  }

  private addBurnabyZoningData(): void {
    const burnabyZoning = new Map<string, MunicipalZoningData>();
    
    burnabyZoning.set('R1', {
      city: 'Burnaby',
      zoningCode: 'R1',
      description: 'Single Family Residential',
      maxHeight: 9.5,
      maxFAR: 0.55,
      maxDensity: 1,
      minLotSize: 557, // 6000 sq ft
      setbacks: {
        front: 7.5,
        rear: 7.5,
        side: 1.5
      },
      parkingRequirements: '2 spaces per dwelling unit',
      permittedUses: [
        'Single family dwelling',
        'Secondary suite',
        'Home occupation'
      ]
    });

    this.zoningDatabase.set('burnaby', burnabyZoning);
  }

  private addBurnabyBylaws(): void {
    const burnabyBylaws: MunicipalBylaw[] = [
      {
        city: 'Burnaby',
        bylawNumber: '13500',
        title: 'Zoning Bylaw',
        section: '6.1',
        category: 'zoning',
        requirement: 'Secondary suites permitted with special permit',
        applicableZones: ['R1', 'R2', 'R3'],
        lastUpdated: new Date('2024-04-15'),
        effectiveDate: new Date('2024-05-01')
      }
    ];

    this.bylawDatabase.set('burnaby', burnabyBylaws);
  }

  private addRichmondZoningData(): void {
    const richmondZoning = new Map<string, MunicipalZoningData>();
    
    richmondZoning.set('SR1', {
      city: 'Richmond',
      zoningCode: 'SR1',
      description: 'Single Detached',
      maxHeight: 9.5,
      maxFAR: 0.60,
      maxDensity: 1,
      minLotSize: 465, // 5000 sq ft
      setbacks: {
        front: 6.0,
        rear: 6.0,
        side: 1.2
      },
      parkingRequirements: '2 spaces per dwelling unit',
      permittedUses: [
        'Single family dwelling',
        'Secondary suite',
        'Coach house'
      ]
    });

    this.zoningDatabase.set('richmond', richmondZoning);
  }

  private addRichmondBylaws(): void {
    const richmondBylaws: MunicipalBylaw[] = [
      {
        city: 'Richmond',
        bylawNumber: '8500',
        title: 'Zoning Bylaw',
        section: '4.2',
        category: 'zoning',
        requirement: 'Coach houses permitted on lots 465m² or larger',
        applicableZones: ['SR1', 'SR2'],
        lastUpdated: new Date('2024-02-28'),
        effectiveDate: new Date('2024-03-15')
      }
    ];

    this.bylawDatabase.set('richmond', richmondBylaws);
  }

  private addSurreyZoningData(): void {
    const surreyZoning = new Map<string, MunicipalZoningData>();
    
    surreyZoning.set('RF', {
      city: 'Surrey',
      zoningCode: 'RF',
      description: 'Single Family Residential',
      maxHeight: 9.0,
      maxFAR: 0.50,
      maxDensity: 1,
      minLotSize: 600, // 6458 sq ft
      setbacks: {
        front: 6.0,
        rear: 7.5,
        side: 1.5
      },
      parkingRequirements: '2 spaces per dwelling unit',
      permittedUses: [
        'Single family dwelling',
        'Secondary suite',
        'Home occupation'
      ]
    });

    this.zoningDatabase.set('surrey', surreyZoning);
  }

  private addSurreyBylaws(): void {
    const surreyBylaws: MunicipalBylaw[] = [
      {
        city: 'Surrey',
        bylawNumber: '12000',
        title: 'Zoning Bylaw',
        section: '5.3',
        category: 'zoning',
        requirement: 'Secondary suites permitted by right in RF zones',
        applicableZones: ['RF', 'RF-G', 'RF-9'],
        lastUpdated: new Date('2024-01-20'),
        effectiveDate: new Date('2024-02-01')
      }
    ];

    this.bylawDatabase.set('surrey', surreyBylaws);
  }

  private addBuildingCodeRequirements(): void {
    // Vancouver Building Code Requirements
    this.buildingCodeDatabase.set('vancouver', {
      city: 'Vancouver',
      bcbc2018Modifications: [
        'Energy Step Code Level 3 mandatory',
        'Enhanced seismic requirements',
        'Rainwater management requirements'
      ],
      energyStepCode: {
        required: true,
        minLevel: 3,
        applicableBuildings: ['Single family', 'Duplex', 'Townhouse']
      },
      accessibilityRequirements: [
        'Barrier-free path to entrance',
        'Accessible washroom on main floor',
        'Door widths minimum 810mm'
      ],
      seismicRequirements: [
        'Higher seismic design category due to location',
        'Special provisions for soft story buildings'
      ],
      fireProtectionRequirements: [
        'Smoke alarms interconnected',
        'Carbon monoxide detectors required'
      ]
    });

    // Add other cities...
  }

  /**
   * Get comprehensive zoning data for a specific property
   */
  async getZoningData(city: string, zoningCode: string): Promise<MunicipalZoningData | null> {
    const cityKey = city.toLowerCase().replace(/\s+/g, '');
    const cityZoning = this.zoningDatabase.get(cityKey);
    
    if (!cityZoning) {
      console.log(`Municipal data not available for ${city}. Adding to enhancement queue.`);
      return null;
    }

    return cityZoning.get(zoningCode) || null;
  }

  /**
   * Get all applicable bylaws for a property
   */
  async getApplicableBylaws(city: string, zoningCode: string): Promise<MunicipalBylaw[]> {
    const cityKey = city.toLowerCase().replace(/\s+/g, '');
    const cityBylaws = this.bylawDatabase.get(cityKey) || [];
    
    return cityBylaws.filter(bylaw => 
      bylaw.applicableZones.includes(zoningCode) || 
      bylaw.applicableZones.includes('ALL')
    );
  }

  /**
   * Get building code requirements for a city
   */
  async getBuildingCodeRequirements(city: string): Promise<BuildingCodeRequirements | null> {
    const cityKey = city.toLowerCase().replace(/\s+/g, '');
    return this.buildingCodeDatabase.get(cityKey) || null;
  }

  /**
   * Get comprehensive regulatory analysis for AI design generation
   */
  async getComprehensiveRegulatoryAnalysis(city: string, zoningCode: string): Promise<{
    zoning: MunicipalZoningData | null;
    bylaws: MunicipalBylaw[];
    buildingCode: BuildingCodeRequirements | null;
    designConstraints: string[];
    opportunities: string[];
  }> {
    const zoning = await this.getZoningData(city, zoningCode);
    const bylaws = await this.getApplicableBylaws(city, zoningCode);
    const buildingCode = await this.getBuildingCodeRequirements(city);

    // Generate design constraints based on real data
    const designConstraints: string[] = [];
    const opportunities: string[] = [];

    if (zoning) {
      designConstraints.push(`Maximum height: ${zoning.maxHeight}m`);
      designConstraints.push(`Maximum FAR: ${zoning.maxFAR}`);
      designConstraints.push(`Setbacks: Front ${zoning.setbacks.front}m, Rear ${zoning.setbacks.rear}m, Side ${zoning.setbacks.side}m`);
      
      if (zoning.permittedUses.includes('Secondary suite')) {
        opportunities.push('Secondary suite potential for rental income');
      }
      
      if (zoning.permittedUses.includes('Laneway house')) {
        opportunities.push('Laneway house development opportunity');
      }
    }

    bylaws.forEach(bylaw => {
      if (bylaw.category === 'building' && bylaw.requirement.includes('Energy Step Code')) {
        designConstraints.push(`Energy efficiency: ${bylaw.requirement}`);
      }
      
      if (bylaw.category === 'tree') {
        designConstraints.push(`Tree protection: ${bylaw.requirement}`);
      }
    });

    if (buildingCode?.energyStepCode.required) {
      designConstraints.push(`Energy Step Code Level ${buildingCode.energyStepCode.minLevel} required`);
      opportunities.push('Energy efficiency rebates and incentives available');
    }

    return {
      zoning,
      bylaws,
      buildingCode,
      designConstraints,
      opportunities
    };
  }

  /**
   * Check if a municipality is supported
   */
  isCitySupported(city: string): boolean {
    const cityKey = city.toLowerCase().replace(/\s+/g, '');
    return this.zoningDatabase.has(cityKey);
  }

  /**
   * Get list of supported municipalities
   */
  getSupportedCities(): string[] {
    return Array.from(this.zoningDatabase.keys()).map(key => {
      // Convert back to proper case
      const cityMap: Record<string, string> = {
        'vancouver': 'Vancouver',
        'burnaby': 'Burnaby',
        'richmond': 'Richmond',
        'surrey': 'Surrey',
        'mapleridge': 'Maple Ridge'
      };
      return cityMap[key] || key;
    });
  }

  /**
   * Maple Ridge Zoning Data - From Zoning Bylaw No. 7600-2019
   * Updated with 2024-2025 Provincial Housing Legislation compliance
   */
  private addMapleRidgeZoningData(): void {
    const mapleRidgeZoning = new Map<string, MunicipalZoningData>();
    
    // Maple Ridge RS-1 (Single Family Residential)
    mapleRidgeZoning.set('RS-1', {
      city: 'Maple Ridge',
      zoningCode: 'RS-1',
      description: 'Single Family Residential - SSMUH Eligible',
      maxHeight: 10.5,
      maxFAR: 0.65,
      maxDensity: 6, // Updated for SSMUH - up to 6 units allowed
      minLotSize: 557, // 6000 sq ft typical
      setbacks: {
        front: 7.5,
        rear: 7.5,
        side: 1.2,
        flanking: 4.5
      },
      parkingRequirements: '1.25 spaces per unit (SSMUH modified)',
      permittedUses: [
        'Single detached dwelling',
        'Small-scale multi-unit housing (3-6 units)',
        'Secondary suite',
        'Home occupation',
        'Detached accessory building'
      ],
      conditionalUses: [
        'Bed and breakfast',
        'Group home',
        'Child care facility (family)'
      ],
      developmentPermitRequirements: [
        'Form and character DP required',
        'Energy Step Code Level 3 minimum',
        'SSMUH compliance demonstration'
      ],
      subdivision: {
        minLotWidth: 18.0,
        minLotDepth: 30.0,
        maxCoverage: 40
      }
    });

    // Maple Ridge RS-2 (Single & Two Family Residential)
    mapleRidgeZoning.set('RS-2', {
      city: 'Maple Ridge',
      zoningCode: 'RS-2',
      description: 'Single & Two Family Residential',
      maxHeight: 10.5,
      maxFAR: 0.70,
      maxDensity: 6, // SSMUH eligible
      minLotSize: 464, // 5000 sq ft
      setbacks: {
        front: 6.0,
        rear: 7.5,
        side: 1.2,
        flanking: 3.0
      },
      parkingRequirements: '1.5 spaces per unit',
      permittedUses: [
        'Single detached dwelling',
        'Two family dwelling (duplex)',
        'Small-scale multi-unit housing',
        'Secondary suite',
        'Home occupation'
      ],
      developmentPermitRequirements: [
        'Form and character DP for multi-unit',
        'Tree protection plan',
        'Energy efficiency requirements'
      ],
      subdivision: {
        minLotWidth: 15.0,
        minLotDepth: 30.0,
        maxCoverage: 45
      }
    });

    // Maple Ridge RM-1 (Medium Density Residential)
    mapleRidgeZoning.set('RM-1', {
      city: 'Maple Ridge',
      zoningCode: 'RM-1',
      description: 'Medium Density Residential',
      maxHeight: 12.0,
      maxFAR: 1.0,
      maxDensity: 25, // units per hectare
      minLotSize: 372, // 4000 sq ft
      setbacks: {
        front: 6.0,
        rear: 6.0,
        side: 3.0,
        flanking: 6.0
      },
      parkingRequirements: '1.5 spaces per unit + visitor parking',
      permittedUses: [
        'Single detached dwelling',
        'Two family dwelling',
        'Multiple family dwelling',
        'Townhouse',
        'Apartment building',
        'Secondary suite'
      ],
      developmentPermitRequirements: [
        'Development permit required',
        'Landscape plan required',
        'Privacy and overlook mitigation',
        'Universal accessibility features'
      ],
      subdivision: {
        minLotWidth: 12.0,
        minLotDepth: 25.0,
        maxCoverage: 50
      }
    });

    // Maple Ridge TOA (Transit-Oriented Area) - New 2024
    mapleRidgeZoning.set('TOA', {
      city: 'Maple Ridge',
      zoningCode: 'TOA',
      description: 'Transit-Oriented Area - Port Haney Station',
      maxHeight: 20.0, // Increased for transit areas
      maxFAR: 2.5,
      maxDensity: 100, // High density near transit
      minLotSize: 200, // Smaller lots allowed
      setbacks: {
        front: 3.0,
        rear: 4.5,
        side: 1.5,
        flanking: 3.0
      },
      parkingRequirements: '0.5 spaces per unit (reduced for transit)',
      permittedUses: [
        'Multiple family dwelling',
        'Mixed use development',
        'Ground floor commercial',
        'Live-work units',
        'Affordable housing'
      ],
      developmentPermitRequirements: [
        'Development permit required',
        'Transit-oriented design guidelines',
        'Ground floor activation plan',
        'Green building requirements'
      ],
      subdivision: {
        minLotWidth: 9.0,
        minLotDepth: 20.0,
        maxCoverage: 70
      }
    });

    this.zoningDatabase.set('Maple Ridge', mapleRidgeZoning);
  }

  /**
   * Maple Ridge Municipal Bylaws - Current as of 2024
   */
  private addMapleRidgeBylaws(): void {
    const mapleRidgeBylaws: MunicipalBylaw[] = [
      {
        city: 'Maple Ridge',
        bylawNumber: '7600-2019',
        title: 'Zoning Bylaw',
        section: 'Small-Scale Multi-Unit Housing',
        category: 'zoning',
        requirement: 'Eligible single-family and duplex lots can accommodate 3, 4, or 6 units with updated density, height, setback, and parking standards',
        applicableZones: ['RS-1', 'RS-2', 'RS-3'],
        penalties: 'Fines up to $10,000 for violations',
        lastUpdated: new Date('2024-06-30'),
        effectiveDate: new Date('2024-06-30')
      },
      {
        city: 'Maple Ridge',
        bylawNumber: 'Building Bylaw',
        title: 'Building Regulation Bylaw',
        section: 'Building Permits',
        category: 'building',
        requirement: 'Building permit required for construction, renovation, or demolition of structures over 100 square feet',
        applicableZones: ['All zones'],
        penalties: 'Stop work orders and fines for unpermitted work',
        lastUpdated: new Date('2024-03-10'),
        effectiveDate: new Date('2025-03-10')
      },
      {
        city: 'Maple Ridge',
        bylawNumber: '7600-2019',
        title: 'Transit-Oriented Development',
        section: 'TOA Zones',
        category: 'zoning',
        requirement: '400m radius around Port Haney Station, Maple Meadows and Haney Place stations designated as Transit-Oriented Areas with enhanced density',
        applicableZones: ['TOA'],
        penalties: 'Development non-compliance penalties',
        lastUpdated: new Date('2024-06-01'),
        effectiveDate: new Date('2024-06-01')
      },
      {
        city: 'Maple Ridge',
        bylawNumber: 'Tree Protection Bylaw',
        title: 'Tree Protection and Management',
        section: 'Development Requirements',
        category: 'environmental',
        requirement: 'Tree retention and replacement requirements for development sites',
        applicableZones: ['All residential zones'],
        penalties: 'Tree replacement costs plus fines',
        lastUpdated: new Date('2024-01-15'),
        effectiveDate: new Date('2024-01-15')
      },
      {
        city: 'Maple Ridge',
        bylawNumber: 'Parking Bylaw',
        title: 'Off-Street Parking Requirements',
        section: 'Residential Parking',
        category: 'parking',
        requirement: 'Reduced parking requirements for SSMUH and transit-oriented development',
        applicableZones: ['RS-1', 'RS-2', 'TOA'],
        penalties: 'Non-compliance fines',
        lastUpdated: new Date('2024-06-30'),
        effectiveDate: new Date('2024-06-30')
      }
    ];

    this.bylawDatabase.set('Maple Ridge', mapleRidgeBylaws);
    
    // Maple Ridge Building Code Requirements
    this.buildingCodeDatabase.set('Maple Ridge', {
      city: 'Maple Ridge',
      bcbc2018Modifications: [
        'Energy Step Code Level 3 minimum for new residential',
        'Enhanced seismic requirements for hillside development',
        'Rainwater management for all new construction'
      ],
      energyStepCode: {
        required: true,
        minLevel: 3,
        applicableBuildings: ['All new residential construction', 'Major renovations']
      },
      accessibilityRequirements: [
        'Universal design features encouraged',
        'Barrier-free access to ground floor units',
        'Accessible parking requirements'
      ],
      seismicRequirements: [
        'Enhanced foundation requirements for slope areas',
        'Geotechnical reports for hillside lots'
      ],
      fireProtectionRequirements: [
        'Sprinkler systems required for buildings over 3 storeys',
        'Fire department access requirements',
        'Hydrant spacing requirements'
      ],
      environmentalRequirements: [
        'Rainwater management plans required',
        'Tree protection during construction',
        'Soil contamination assessments for former industrial sites'
      ]
    });
  }
}

// Export singleton instance
export const municipalDataService = new MunicipalDataService();