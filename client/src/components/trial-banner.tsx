import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CreditCard, X } from "lucide-react";

interface TrialBannerProps {
  daysRemaining: number;
  onUpgrade: () => void;
}

export default function TrialBanner({ daysRemaining, onUpgrade }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const isExpired = daysRemaining <= 0;
  const isUrgent = daysRemaining <= 2;

  return (
    <Card className={`mb-6 border-2 ${
      isExpired 
        ? 'border-red-500 bg-red-50' 
        : isUrgent 
          ? 'border-orange-500 bg-orange-50' 
          : 'border-blue-500 bg-blue-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isExpired 
                ? 'bg-red-100' 
                : isUrgent 
                  ? 'bg-orange-100' 
                  : 'bg-blue-100'
            }`}>
              <Clock className={`w-5 h-5 ${
                isExpired 
                  ? 'text-red-600' 
                  : isUrgent 
                    ? 'text-orange-600' 
                    : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h4 className={`font-semibold ${
                isExpired 
                  ? 'text-red-900' 
                  : isUrgent 
                    ? 'text-orange-900' 
                    : 'text-blue-900'
              }`}>
                {isExpired 
                  ? 'Trial Expired' 
                  : `${daysRemaining} Day${daysRemaining === 1 ? '' : 's'} Remaining`}
              </h4>
              <p className={`text-sm ${
                isExpired 
                  ? 'text-red-700' 
                  : isUrgent 
                    ? 'text-orange-700' 
                    : 'text-blue-700'
              }`}>
                {isExpired
                  ? 'Upgrade now to continue using BuildwiseAI Professional tools'
                  : 'Upgrade to continue accessing all professional builder features'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={onUpgrade}
              className={`flex items-center gap-2 ${
                isExpired 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : isUrgent 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              data-testid="upgrade-button"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade Now - $197/month
            </Button>
            
            {!isExpired && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}