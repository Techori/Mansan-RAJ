import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  discount: number;
  onDiscountChange: (value: number) => void;
  discountType: 'amount' | 'percentage';
  onDiscountTypeChange: (value: 'amount' | 'percentage') => void;
}

const DiscountDialog: React.FC<DiscountDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  discount,
  onDiscountChange,
  discountType,
  onDiscountTypeChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="discountValue">Discount Value</Label>
            <div className="flex">
              <Input
                id="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                className="rounded-r-none"
              />
              <RadioGroup 
                value={discountType} 
                onValueChange={(value: 'amount' | 'percentage') => onDiscountTypeChange(value)}
                className="flex items-center border rounded-l-none border-l-0 p-2"
              >
                <div className="flex items-center space-x-1 mr-3">
                  <RadioGroupItem value="amount" id="amount" />
                  <Label htmlFor="amount">₹</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage">%</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountDialog; 