import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShoppingCart, FileText } from 'lucide-react';

interface SaleSummaryProps {
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
  onCreateSale: () => void;
  onPreviewBill: () => void;
  onClearItems: () => void;
  isDisabled: boolean;
}

const SaleSummary: React.FC<SaleSummaryProps> = ({
  subtotal,
  totalDiscount,
  totalGst,
  grandTotal,
  onCreateSale,
  onPreviewBill,
  onClearItems,
  isDisabled,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-gray-600">Total Amount (Excl.)</Label>
              <div className="font-medium">₹{subtotal.toFixed(2)}</div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm text-gray-600">Total Discount</Label>
              <div className="font-medium">₹{totalDiscount.toFixed(2)}</div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm text-gray-600">Total GST</Label>
              <div className="font-medium">₹{totalGst.toFixed(2)}</div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm text-gray-600 font-bold">Grand Total</Label>
              <div className="font-bold text-lg">₹{grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>
      
      <div>
        <Card className="p-6">
          <div className="space-y-4">
            <Button 
              className="w-full"
              size="lg"
              disabled={isDisabled}
              onClick={onCreateSale}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Bill
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onPreviewBill}
              disabled={isDisabled}
            >
              <FileText className="mr-2 h-4 w-4" />
              Preview Final Bill
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onClearItems}
              disabled={isDisabled}
            >
              Clear All
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SaleSummary; 