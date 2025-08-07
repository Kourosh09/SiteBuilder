// Vancouver Open Data API Integration
// Free access to real permit data

interface VancouverPermit {
  permitnumber: string;
  permittype: string;
  propertyuse: string;
  specificusecategory: string;
  address: string;
  projectvalue: number;
  issueddate: string;
  permitcategory: string;
  projectdescription: string;
  geom?: {
    coordinates: [number, number];
  };
}

export async function getVancouverPermits(limit: number = 100): Promise<VancouverPermit[]> {
  try {
    const response = await fetch(
      `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits&rows=${limit}&sort=-issueddate`
    );
    
    if (!response.ok) {
      throw new Error(`Vancouver Open Data API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.records.map((record: any) => record.fields);
  } catch (error) {
    console.error('Error fetching Vancouver permits:', error);
    throw error;
  }
}

export async function searchVancouverPermitsByAddress(address: string): Promise<VancouverPermit[]> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=issued-building-permits&q=${encodedAddress}&rows=50`
    );
    
    if (!response.ok) {
      throw new Error(`Vancouver Open Data API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.records.map((record: any) => record.fields);
  } catch (error) {
    console.error('Error searching Vancouver permits:', error);
    throw error;
  }
}

export async function getVancouverPermitStats() {
  try {
    const permits = await getVancouverPermits(1000);
    
    const stats = {
      total: permits.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      totalValue: 0,
      avgValue: 0
    };
    
    permits.forEach(permit => {
      // Count by type
      const type = permit.permittype || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Count by category
      const category = permit.permitcategory || 'Unknown';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Calculate values
      if (permit.projectvalue) {
        stats.totalValue += permit.projectvalue;
      }
    });
    
    stats.avgValue = stats.totalValue / permits.length;
    
    return stats;
  } catch (error) {
    console.error('Error calculating Vancouver permit stats:', error);
    throw error;
  }
}