import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CalculationData {
  landPrice: string;
  lotSize: string;
  fsr: string;
  constructionCost: string;
  salePrice: string;
  softCosts: string;
  buildableArea: string;
  totalRevenue: string;
  totalCosts: string;
  netProfit: string;
  roi: string;
}

export default function CalculatorDemo() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    landPrice: "750000",
    lotSize: "8000",
    fsr: "0.6",
    constructionCost: "350",
    salePrice: "850",
    softCosts: "15"
  });

  const [results, setResults] = useState({
    buildableArea: "4,800 sqft",
    totalRevenue: "$4,080,000",
    totalCosts: "$2,682,000",
    netProfit: "$1,398,000",
    roi: "52.1%",
    recommendation: "GO"
  });

  const saveCalculationMutation = useMutation({
    mutationFn: async (calculationData: CalculationData) => {
      return await apiRequest("POST", "/api/calculations", calculationData);
    },
    onSuccess: () => {
      toast({
        title: "Calculation Saved",
        description: "Your feasibility analysis has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save calculation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateFeasibility = () => {
    const landPrice = parseFloat(formData.landPrice) || 0;
    const lotSize = parseFloat(formData.lotSize) || 0;
    const fsr = parseFloat(formData.fsr) || 0;
    const constructionCost = parseFloat(formData.constructionCost) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;
    const softCosts = parseFloat(formData.softCosts) || 0;

    // Calculations
    const buildableArea = lotSize * fsr;
    const hardCosts = buildableArea * constructionCost;
    const softCostAmount = hardCosts * (softCosts / 100);
    const totalCosts = landPrice + hardCosts + softCostAmount;
    const totalRevenue = buildableArea * salePrice;
    const netProfit = totalRevenue - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    const recommendation = roi > 20 ? "GO" : "NO-GO";

    const newResults = {
      buildableArea: buildableArea.toLocaleString() + " sqft",
      totalRevenue: "$" + totalRevenue.toLocaleString(),
      totalCosts: "$" + totalCosts.toLocaleString(),
      netProfit: "$" + netProfit.toLocaleString(),
      roi: roi.toFixed(1) + "%",
      recommendation
    };

    setResults(newResults);

    // Save calculation
    const calculationData: CalculationData = {
      landPrice: formData.landPrice,
      lotSize: formData.lotSize,
      fsr: formData.fsr,
      constructionCost: formData.constructionCost,
      salePrice: formData.salePrice,
      softCosts: formData.softCosts,
      buildableArea: newResults.buildableArea,
      totalRevenue: newResults.totalRevenue,
      totalCosts: newResults.totalCosts,
      netProfit: newResults.netProfit,
      roi: newResults.roi
    };

    saveCalculationMutation.mutate(calculationData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="calculator" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Try Our Feasibility Calculator
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            See how BuildwiseAI can instantly analyze your next development opportunity.
          </p>
        </div>

        <div className="bg-gradient-to-br from-neutral-50 to-gray-100 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator Input Form */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-6">Project Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="landPrice" className="text-sm font-medium text-neutral-700 mb-2">
                    Land Price ($)
                  </Label>
                  <Input
                    id="landPrice"
                    type="number"
                    value={formData.landPrice}
                    onChange={(e) => handleInputChange("landPrice", e.target.value)}
                    placeholder="750,000"
                    className="w-full"
                    data-testid="input-land-price"
                  />
                </div>
                <div>
                  <Label htmlFor="lotSize" className="text-sm font-medium text-neutral-700 mb-2">
                    Lot Size (sqft)
                  </Label>
                  <Input
                    id="lotSize"
                    type="number"
                    value={formData.lotSize}
                    onChange={(e) => handleInputChange("lotSize", e.target.value)}
                    placeholder="8,000"
                    className="w-full"
                    data-testid="input-lot-size"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fsr" className="text-sm font-medium text-neutral-700 mb-2">
                    FSR/Density
                  </Label>
                  <Input
                    id="fsr"
                    type="number"
                    step="0.1"
                    value={formData.fsr}
                    onChange={(e) => handleInputChange("fsr", e.target.value)}
                    placeholder="0.6"
                    className="w-full"
                    data-testid="input-fsr"
                  />
                </div>
                <div>
                  <Label htmlFor="constructionCost" className="text-sm font-medium text-neutral-700 mb-2">
                    Construction Cost ($/sqft)
                  </Label>
                  <Input
                    id="constructionCost"
                    type="number"
                    value={formData.constructionCost}
                    onChange={(e) => handleInputChange("constructionCost", e.target.value)}
                    placeholder="350"
                    className="w-full"
                    data-testid="input-construction-cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salePrice" className="text-sm font-medium text-neutral-700 mb-2">
                    Sale Price ($/sqft)
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange("salePrice", e.target.value)}
                    placeholder="850"
                    className="w-full"
                    data-testid="input-sale-price"
                  />
                </div>
                <div>
                  <Label htmlFor="softCosts" className="text-sm font-medium text-neutral-700 mb-2">
                    Soft Costs (%)
                  </Label>
                  <Input
                    id="softCosts"
                    type="number"
                    value={formData.softCosts}
                    onChange={(e) => handleInputChange("softCosts", e.target.value)}
                    placeholder="15"
                    className="w-full"
                    data-testid="input-soft-costs"
                  />
                </div>
              </div>

              <Button
                onClick={calculateFeasibility}
                className="w-full bg-brand-blue text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                disabled={saveCalculationMutation.isPending}
                data-testid="button-calculate"
              >
                {saveCalculationMutation.isPending ? "Calculating..." : "Calculate Feasibility"}
              </Button>
            </div>

            {/* Results Dashboard */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-6">Analysis Results</h3>
              
              <div className="space-y-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-sm text-neutral-600 mb-1">Buildable Area</div>
                  <div className="text-2xl font-bold text-neutral-900" data-testid="text-buildable-area">
                    {results.buildableArea}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-neutral-600 mb-1">Total Revenue</div>
                    <div className="text-xl font-bold text-brand-green" data-testid="text-total-revenue">
                      {results.totalRevenue}
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-neutral-600 mb-1">Total Costs</div>
                    <div className="text-xl font-bold text-neutral-900" data-testid="text-total-costs">
                      {results.totalCosts}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-brand-green to-green-600 p-6 rounded-lg text-white">
                  <div className="text-sm opacity-90 mb-1">Net Profit</div>
                  <div className="text-3xl font-bold" data-testid="text-net-profit">
                    {results.netProfit}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    ROI: <span className="font-semibold" data-testid="text-roi">{results.roi}</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  results.recommendation === "GO" 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      results.recommendation === "GO" 
                        ? "bg-brand-green" 
                        : "bg-red-500"
                    }`}>
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className={`font-semibold ${
                        results.recommendation === "GO" 
                          ? "text-green-800" 
                          : "text-red-800"
                      }`} data-testid="text-recommendation">
                        Recommended: {results.recommendation}
                      </div>
                      <div className={`text-sm ${
                        results.recommendation === "GO" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {results.recommendation === "GO" 
                          ? "Strong profitability metrics" 
                          : "Consider revising project parameters"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
