import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from '@/lib/queryClient';

interface LotAnalysisResult {
  address: string;
  city: string;
  lotSize: number;
  zoning: string;
  
  transitAccessibility: {
    rapidTransit: {
      within800m: boolean;
      within400m: boolean;
      within200m: boolean;
      stationType: string;
      frequency: string;
      distance: number;
    };
    frequentTransit: {
      within400m: boolean;
      serviceLevel: string;
      busRoutes: number;
    };
  };
  
  developmentPotential: {
    currentAllowance: {
      units: number;
      storeys: number;
      fsr: number;
    };
    bill44Allowance: {
      units: number;
      eligible: boolean;
      reason: string;
    };
    bill47Allowance: {
      units: number;
      storeys: number;
      fsr: number;
      eligible: boolean;
      todZone: '200m' | '400m' | '800m' | 'none';
    };
    maximumPotential: {
      units: number;
      storeys: number;
      fsr: number;
      pathway: string;
    };
  };
  
  compliance: {
    bill44: {
      fourPlexEligible: boolean;
      sixPlexEligible: boolean;
      requirements: string[];
    };
    bill47: {
      todEligible: boolean;
      densityTier: string;
      heightAllowance: string;
      parkingRequired: boolean;
    };
    municipal: {
      zoningCompliant: boolean;
      specialRequirements: string[];
    };
  };
  
  marketContext: {
    assessedValue: number;
    marketValue: number;
    developmentViability: 'High' | 'Medium' | 'Low';
    constructionCosts: number;
    expectedRoi: number;
  };
}

export default function LotAnalysisDemo() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LotAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!address || !city) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, city })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      setResult(data.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="lot-analysis-demo">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🏠 Comprehensive Lot Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter a property address to get complete development potential analysis using authentic BC legislation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Property address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              data-testid="input-address"
            />
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-testid="input-city"
            />
            <Button 
              onClick={handleAnalyze}
              disabled={!address || !city || isLoading}
              data-testid="button-analyze"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Lot'}
            </Button>
          </div>
          
          {error && (
            <div className="text-red-600 p-3 bg-red-50 rounded" data-testid="error-message">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Property Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Address:</strong> {result.address}</div>
                <div><strong>City:</strong> {result.city}</div>
                <div><strong>Lot Size:</strong> {result.lotSize.toLocaleString()} sq ft</div>
                <div><strong>Zoning:</strong> {result.zoning}</div>
              </div>
            </CardContent>
          </Card>

          {/* Transit Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle>🚊 Transit Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Rapid Transit (SkyTrain)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span>{result.transitAccessibility.rapidTransit.distance}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Station Type:</span>
                    <span>{result.transitAccessibility.rapidTransit.stationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span className="text-xs">{result.transitAccessibility.rapidTransit.frequency}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={result.transitAccessibility.rapidTransit.within200m ? "default" : "secondary"}>
                      200m: {result.transitAccessibility.rapidTransit.within200m ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={result.transitAccessibility.rapidTransit.within400m ? "default" : "secondary"}>
                      400m: {result.transitAccessibility.rapidTransit.within400m ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={result.transitAccessibility.rapidTransit.within800m ? "default" : "secondary"}>
                      800m: {result.transitAccessibility.rapidTransit.within800m ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Frequent Transit (Bus)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Within 400m:</span>
                    <Badge variant={result.transitAccessibility.frequentTransit.within400m ? "default" : "secondary"}>
                      {result.transitAccessibility.frequentTransit.within400m ? "Eligible" : "Not eligible"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Level:</span>
                    <span>{result.transitAccessibility.frequentTransit.serviceLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bus Routes:</span>
                    <span>{result.transitAccessibility.frequentTransit.busRoutes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Potential */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>🏗️ Development Potential Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Current Zoning */}
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Current Zoning</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Units:</strong> {result.developmentPotential.currentAllowance.units}</div>
                    <div><strong>Storeys:</strong> {result.developmentPotential.currentAllowance.storeys}</div>
                    <div><strong>FSR:</strong> {result.developmentPotential.currentAllowance.fsr}</div>
                  </div>
                </div>

                {/* Bill 44 SSMUH */}
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Bill 44 (SSMUH)</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Units:</strong> {result.developmentPotential.bill44Allowance.units}</div>
                    <div className="mb-2">
                      <Badge variant={result.developmentPotential.bill44Allowance.eligible ? "default" : "secondary"}>
                        {result.developmentPotential.bill44Allowance.eligible ? "Eligible" : "Not eligible"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.developmentPotential.bill44Allowance.reason}
                    </div>
                  </div>
                </div>

                {/* Bill 47 TOD */}
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Bill 47 (TOD)</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Units:</strong> {result.developmentPotential.bill47Allowance.units}</div>
                    <div><strong>Storeys:</strong> {result.developmentPotential.bill47Allowance.storeys}</div>
                    <div><strong>FSR:</strong> {result.developmentPotential.bill47Allowance.fsr}</div>
                    <div className="mb-2">
                      <Badge variant={result.developmentPotential.bill47Allowance.eligible ? "default" : "secondary"}>
                        {result.developmentPotential.bill47Allowance.todZone !== 'none' ? result.developmentPotential.bill47Allowance.todZone : 'Not in TOD'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Maximum Potential */}
                <div className="p-4 border rounded bg-green-50">
                  <h4 className="font-medium mb-2 text-green-800">Maximum Potential</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Units:</strong> {result.developmentPotential.maximumPotential.units}</div>
                    <div><strong>Storeys:</strong> {result.developmentPotential.maximumPotential.storeys}</div>
                    <div><strong>FSR:</strong> {result.developmentPotential.maximumPotential.fsr}</div>
                    <div className="text-xs text-green-600 mt-2">
                      via {result.developmentPotential.maximumPotential.pathway}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Bill 44 Compliance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>4-plex Eligible:</span>
                    <Badge variant={result.compliance.bill44.fourPlexEligible ? "default" : "secondary"}>
                      {result.compliance.bill44.fourPlexEligible ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>6-plex Eligible:</span>
                    <Badge variant={result.compliance.bill44.sixPlexEligible ? "default" : "secondary"}>
                      {result.compliance.bill44.sixPlexEligible ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Bill 47 TOD Compliance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>TOD Eligible:</span>
                    <Badge variant={result.compliance.bill47.todEligible ? "default" : "secondary"}>
                      {result.compliance.bill47.todEligible ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    <div><strong>Density Tier:</strong> {result.compliance.bill47.densityTier}</div>
                    <div><strong>Height Allowance:</strong> {result.compliance.bill47.heightAllowance}</div>
                    <div><strong>Parking Required:</strong> {result.compliance.bill47.parkingRequired ? "Yes" : "No"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Context */}
          <Card>
            <CardHeader>
              <CardTitle>💰 Market Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Assessed Value:</span>
                  <div className="text-lg">{formatCurrency(result.marketContext.assessedValue)}</div>
                </div>
                <div>
                  <span className="font-medium">Market Value:</span>
                  <div className="text-lg">{formatCurrency(result.marketContext.marketValue)}</div>
                </div>
                <div>
                  <span className="font-medium">Construction Cost:</span>
                  <div>${result.marketContext.constructionCosts}/sq ft</div>
                </div>
                <div>
                  <span className="font-medium">Expected ROI:</span>
                  <div className={`text-lg ${result.marketContext.expectedRoi > 15 ? 'text-green-600' : result.marketContext.expectedRoi > 8 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.marketContext.expectedRoi.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Badge 
                  variant={
                    result.marketContext.developmentViability === 'High' ? 'default' :
                    result.marketContext.developmentViability === 'Medium' ? 'secondary' : 'outline'
                  }
                >
                  {result.marketContext.developmentViability} Viability
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}