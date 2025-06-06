import React from 'react';
import { Card } from '@/components/ui/card';

interface CompanySummaryProps {
  summaries: Record<string, {
    id: string;
    name: string;
    subtotal: number;
    discount: number;
    gst: number;
    total: number;
  }>;
}

const CompanySummary: React.FC<CompanySummaryProps> = ({ summaries }) => {
  if (!summaries || Object.keys(summaries).length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Company-wise Summary</h3>
      <div className="grid gap-4">
        {Object.values(summaries).map((company, index) => (
          <div key={index} className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{company.name}</h4>
              <span className="font-bold">₹{company.total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Subtotal:</span> ₹{company.subtotal.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-500">Discount:</span> ₹{company.discount.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-500">GST:</span> ₹{company.gst.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CompanySummary; 