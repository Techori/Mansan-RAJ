
import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '../../contexts/InventoryContext';
import { useCompany } from '../../contexts/CompanyContext';
import { toast } from 'sonner';


interface ItemFormProps {
  item?: Item;
  onSubmit: (formData: Omit<Item, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  companyId?: string;
}

// Define sales units
const SALES_UNITS = ['Case', 'Packet', 'Piece'];
// Define GST rates
const GST_RATES = [5, 12, 18, 28];

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel, companyId }) => {
  // const { filteredGodowns } = useInventory();
  const { companies } = useCompany();

  const [formData, setFormData] = useState<Omit<Item, 'id' | 'createdAt'>>({
    companyId: companyId || '',
    itemId: '',
    name: '',
    unitPrice: 0,
    mrp: 0,
    gstPercentage: 18,
    hsn: '',
    godown: '',
    stockQuantity: 0,
    salesUnit: 'Piece',
    company:'',
    rateAfterGst : 0
  });

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        companyId: item.companyId,
        itemId: item.itemId,
        unitPrice: item.unitPrice,
        mrp: item.mrp || 0,
        gstPercentage: item.gstPercentage,
        hsn: item.hsn || '',
        // godownId: item.godownId,
        stockQuantity: item.stockQuantity,
        salesUnit: item.salesUnit || 'Piece', // Default to 'Piece' if not set
        godown : item.godown,
        rateAfterGst : item.rateAfterGst,
        name : item.name,
        company : item.company
      });
    } else {
      // Reset form if not editing
      setFormData({
        companyId: companyId || '',
        itemId: '',
        name: '',
        unitPrice: 0,
        mrp: 0,
        gstPercentage: 18,
        hsn: '',
        godown : '',
        company : '',
        rateAfterGst : 0,
        stockQuantity: 0,
        salesUnit: 'Piece',
      });
    }
  }, [item, companyId, ]);

  // Automatically calculate MRP when unitPrice or gstPercentage changes
  useEffect(() => {
    if (formData.unitPrice && formData.gstPercentage) {
      const calculatedMRP = formData.unitPrice * (1 + formData.gstPercentage / 100);
      setFormData(prev => ({
        ...prev,
        mrp: parseFloat(calculatedMRP.toFixed(2))
      }));
    }
  }, [formData.unitPrice, formData.gstPercentage,]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? 0 : parseFloat(value),
    }));
  };

  const handleTypeChange = (value: 'GST' | 'NON-GST') => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      // Reset GST percentage if type is NON-GST
      gstPercentage: value === 'NON-GST' ? undefined : prev.gstPercentage || 18,
      // Reset HSN code if type is NON-GST
      hsnCode: value === 'NON-GST' ? undefined : prev.hsn,
    }));
  };

  const handleCompanyChange = (value: string) => {
    const selectedCompany = companies.find(c => c.id === value);
    
    if (selectedCompany) {
      // Set type based on company
      // let type: 'GST' | 'NON-GST' = formData.type;
      
      // if (selectedCompany.name === 'Mansan Laal and Sons') {
      //   type = 'GST';
      // } else if (selectedCompany.name === 'Estimate') {
      //   type = 'NON-GST';
      // }
      
      setFormData((prev) => ({
        ...prev,
        companyId: value,
      
        gstPercentage: prev.gstPercentage,
        hsnCode: prev.hsn
      }));
    }
  };

  const validateForm = (): boolean => {
    // Validate company selection
    if (!formData.companyId) {
      toast.error('Please select a company');
      return false;
    }
    
    // Get company name for specific validations
    const company = companies.find(c => c.id === formData.companyId);
    
    // Company-specific validations
    // if (company) {
    //   if (company.name === 'Mansan Laal and Sons') {
    //     if (formData.type !== 'GST') {
    //       toast.error('Mansan Laal and Sons requires GST items only');
    //       return false;
    //     }
        
    //     if (!formData.hsn) {
    //       toast.error('HSN Code is required for Mansan Laal and Sons items');
    //       return false;
    //     }
    //   }
      
    //   if (company.name === 'Estimate' && formData.type !== 'NON-GST') {
    //     toast.error('Estimate company only accepts Non-GST items');
    //     return false;
    //   }
    // }
    
    // // Validate that GST items have HSN code
    // if (formData.type === 'GST' && !formData.hsnCode) {
    //   toast.error('HSN Code is required for GST items');
    //   return false;
    // }
    
    // Validate MRP calculation for GST items
    if ( formData.gstPercentage && formData.mrp) {
      const calculatedMRP = formData.unitPrice * (1 + formData.gstPercentage / 100);
      if (Math.abs(calculatedMRP - formData.mrp) > 0.01) { // Allow small rounding difference
        toast.error(`MRP should be equal to Excl. Cost + GST (${calculatedMRP.toFixed(2)})`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Get selected company name
  const selectedCompanyName = companies.find(c => c.id === formData.companyId)?.name || '';

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {item ? 'Edit Item' : 'Add New Item'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyId">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={handleCompanyChange}
            >
              <SelectTrigger>
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
          
          <div>
            <Label htmlFor="itemId">Item ID</Label>
            <Input
              id="itemId"
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              placeholder="Enter item ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Item Type</Label>
            <Select
              // value={formData.type}
              onValueChange={(value: 'GST' | 'NON-GST') => handleTypeChange(value)}
              disabled={selectedCompanyName === 'Mansan Laal and Sons' || selectedCompanyName === 'Estimate'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="NON-GST">NON-GST</SelectItem>
              </SelectContent>
            </Select>
            {selectedCompanyName === 'Mansan Laal and Sons' && (
              <p className="text-xs text-muted-foreground mt-1">
                Mansan Laal and Sons requires GST items only
              </p>
            )}
            {selectedCompanyName === 'Estimate' && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimate company requires Non-GST items only
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="unitPrice">Unit Price (Excl. GST)</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={handleChange}
              required
            />
          </div>

          {formData.gstPercentage && (
            <>
              <div>
                <Label htmlFor="gstPercentage">GST Percentage (%)</Label>
                <Select
                  value={formData.gstPercentage?.toString() || ''}
                  onValueChange={(value) => handleNumberChange('gstPercentage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>
                        {rate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  name="hsnCode"
                  value={formData.hsn || ''}
                  onChange={handleChange}
                  placeholder="Enter HSN Code"
                  // required={formData.type === 'GST'}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="mrp">MRP</Label>
            <Input
              id="mrp"
              name="mrp"
              type="number"
              min="0"
              step="0.01"
              value={formData.mrp || ''}
              onChange={handleChange}
              required
            />
            {formData.unitPrice && formData.gstPercentage && (
              <p className="text-xs text-muted-foreground mt-1">
                Calculated: ₹{(formData.unitPrice * (1 + formData.gstPercentage / 100)).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="godownId">Godown</Label>
            {/* <Select
              value={formData.godownId}
              onValueChange={(value) => handleSelectChange('godownId', value)}
            > */}
              <SelectTrigger>
                <SelectValue placeholder="Select godown" />
              </SelectTrigger>
              <SelectContent>
                {/* {filteredGodowns.map((godown) => (
                  <SelectItem key={godown.id} value={godown.id}>
                    {godown.name}
                  </SelectItem> */}
                {/* ))} */}
              </SelectContent>
            {/* </Select> */}
          </div>

          <div>
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="salesUnit">Sales Unit</Label>
            <Select
              value={formData.salesUnit}
              onValueChange={(value) => handleSelectChange('salesUnit', value as 'Case' | 'Packet' | 'Piece')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sales unit" />
              </SelectTrigger>
              <SelectContent>
                {SALES_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{item ? 'Update' : 'Save'}</Button>
        </div>
      </form>
    </Card>
  );
};

export default ItemForm;
