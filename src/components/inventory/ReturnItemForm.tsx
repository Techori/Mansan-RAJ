import React, { useState, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useCompany } from '../../contexts/CompanyContext';
import { Item } from '../../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface ReturnItemFormProps {
  onCancel: () => void;
  preselectedItemId?: string;
  preselectedCompanyId?: string;
}

const ReturnItemForm: React.FC<ReturnItemFormProps> = ({ 
  onCancel,
  preselectedItemId,
  preselectedCompanyId
}) => {
  const { companies } = useCompany();
  const { items, getItemsByCompany, updateStock } = useInventory();
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(preselectedCompanyId || '');
  const [selectedItemId, setSelectedItemId] = useState<string>(preselectedItemId || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [companyItems, setCompanyItems] = useState<Item[]>([]);
  const [salesUnit, setSalesUnit] = useState<'Case' | 'Packet' | 'Piece'>('Piece');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Update company items when company selection changes
  useEffect(() => {
    if (selectedCompanyId) {
      const filteredItems = getItemsByCompany(selectedCompanyId);
      setCompanyItems(filteredItems);

      // Clear item selection if not in this company
      if (selectedItemId && !filteredItems.some(item => item.id === selectedItemId)) {
        setSelectedItemId('');
        setSelectedItem(null);
      }
    } else {
      setCompanyItems([]);
      setSelectedItemId('');
      setSelectedItem(null);
    }
  }, [selectedCompanyId, getItemsByCompany, selectedItemId]);

  // Set selected item
  useEffect(() => {
    if (selectedItemId) {
      const item = items.find(item => item.id === selectedItemId);
      setSelectedItem(item || null);
      if (item) {
        setSalesUnit(item.salesUnit);
      }
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId, items]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleReturnItem = () => {
    if (!selectedItemId || !selectedCompanyId || quantity <= 0) {
      toast.error('Please select company, item and enter a valid quantity');
      return;
    }

    try {
      // Call updateStock with negative quantity to add back to inventory
      updateStock(selectedItemId, -quantity, salesUnit);
      
      toast.success(`${quantity} ${salesUnit}(s) of ${selectedItem?.name} returned successfully`);
      onCancel(); // Close form after success
    } catch (error) {
      toast.error('Failed to return item. Stock update functionality is limited in the current version.');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Return Item</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Select 
            value={selectedCompanyId} 
            onValueChange={handleCompanyChange}
            disabled={!!preselectedCompanyId}
          >
            <SelectTrigger id="company">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item">Item</Label>
          <Select 
            value={selectedItemId} 
            onValueChange={handleItemChange}
            disabled={!selectedCompanyId || !!preselectedItemId}
          >
            <SelectTrigger id="item">
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {companyItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} - {item.itemId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesUnit">Unit</Label>
            <Select 
              value={salesUnit} 
              onValueChange={(value: 'Case' | 'Packet' | 'Piece') => setSalesUnit(value)}
            >
              <SelectTrigger id="salesUnit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Case">Case</SelectItem>
                <SelectItem value="Packet">Packet</SelectItem>
                <SelectItem value="Piece">Piece</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedItem && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">Current Stock: {selectedItem.stockQuantity} {selectedItem.salesUnit}(s)</p>
          </div>
        )}

        <Button 
          className="w-full mt-4" 
          onClick={handleReturnItem}
          disabled={!selectedItemId || !selectedCompanyId || quantity <= 0}
        >
          Return Item
        </Button>
      </div>
    </Card>
  );
};

export default ReturnItemForm;
