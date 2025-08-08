import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Mail, Phone } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <Card className="bg-blue-50 border-blue-200 mt-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">How We Handle Your Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span><strong>Email:</strong> Used to send your analysis report and follow-up with relevant BC development opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span><strong>Phone:</strong> For priority consultation calls when high-value development opportunities match your analysis</span>
              </div>
              <p className="text-blue-700 mt-2">
                ✓ Your data stays secure in Canada<br/>
                ✓ We only contact you about relevant BC development opportunities<br/>
                ✓ You can unsubscribe anytime<br/>
                ✓ We never sell or share your information
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}