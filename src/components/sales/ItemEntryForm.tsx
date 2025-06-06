import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Item, SaleItem } from '../../types';
import { useInventory } from '../../contexts/InventoryContext';
import { toast } from 'sonner';
import { calculateExclusiveCost, calculateMRP, calculateGstAmount } from '../../utils/pricingUtils';
import { useCustomers } from '../../contexts/CustomersContext';


// Define sales units
const SALES_UNITS = ['Case', 'Packet', 'Piece'];

type ItemEntryFormProps = {
  onAddItem: (item: SaleItem) => void;
  companies: any[];
  items: Item[];
};

const ItemEntryForm: React.FC<ItemEntryFormProps> = ({
  onAddItem,
  companies,
  items,
}) => {
  const { groupedCustomers } = useCustomers();
  const [company,setCompany] = useState<string>('');
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedGodown, setSelectedGodown] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [salesUnit, setSalesUnit] = useState<string>('Piece');
  const [mrp, setMrp] = useState<number>(0);
  const [gstRate,setGstRate] = useState<number>(0)
  const [hsnCode,setHsnCode] = useState<string>('')
  const [exclusiveCost, setExclusiveCost] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [packagingDetails, setPackagingDetails] = useState<string>('');

  // Filter items based on search
  const filteredSearchItems = useMemo(() => {
    if (!searchTerm || !items || items.length === 0) {
      return items || [];
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      (item.name && item.name.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, items]);

  // Update item details when item selection changes
  React.useEffect(() => {
    if (items && items.length > 0) {
      const item = items.find((item) => item.name === selectedItemName);
      console.log("item",item)
      if (item) {
        setSelectedItem(item);
        // Set default godown if available
        if (item.godown && item.godown.length > 0) {
          setSelectedGodown(item.godown[0].name);
        } else {
          setSelectedGodown('');
        }
        // Set GST rate based on company and item
        setGstRate(item.gstPercentage);
        setHsnCode(item.hsn);
        setCompany(item.company)
        setExclusiveCost(item.unitPrice || 0)
        
        // if (item.gstPercentage > 0) {
        //   if (item.mrp) {
        //     setMrp(item.mrp);
        //     const calculatedExclusiveCost = calculateExclusiveCost(item.mrp, item.gstPercentage);
        //     setExclusiveCost(calculatedExclusiveCost);
        //     const calculatedGstAmount = calculatedExclusiveCost * (item.gstPercentage / 100) * (quantity || 0);
        //     setGstAmount(calculatedGstAmount);
        //   } else {
        //     setExclusiveCost(item.unitPrice || 0);
        //     const calculatedMrp = calculateMRP(item.unitPrice || 0, item.gstPercentage);
        //     setMrp(calculatedMrp);
        //     const calculatedGstAmount = (item.unitPrice || 0) * (item.gstPercentage / 100) * (quantity || 0);
        //     setGstAmount(calculatedGstAmount);
        //   }
        // } else {
        //   setExclusiveCost(item.unitPrice || 0);
        //   setMrp(item.unitPrice || 0);
        //   setGstAmount(0);
        // }

        
      } else {
        setSelectedItem(null);
        setMrp(0);
        setExclusiveCost(0);
        setGstAmount(0);
      }
    }
  }, [selectedItemName, items, quantity]);

  // Reset form function
  const resetForm = () => {
    setSelectedItemName('');
    setSelectedItem(null);
    setQuantity(0);
    setDiscount(0);
    setHsnCode('')
    setSearchTerm('');
    setIsItemPopoverOpen(false);
  };

  // Handle adding item to bill
  const handleAddItem = () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (!selectedGodown) {
      toast.error('Please select a godown');
      return;
    }
    let discountValue = 0;
    let discountPercentage = 0;
    if (discount > 0) {
      if (discountType === 'amount') {
        discountValue = discount;
        discountPercentage = (discount / (exclusiveCost * quantity)) * 100;
      } else {
        discountPercentage = discount;
        discountValue = (exclusiveCost * quantity * discount) / 100;
      }
    }
    const baseAmount = exclusiveCost * quantity;
    const discountedBaseAmount = baseAmount - discountValue;
    let itemGstAmount = 0;
    if (gstRate > 0) {
      itemGstAmount = (discountedBaseAmount * gstRate) / 100;
    }
    const totalPrice = discountedBaseAmount + itemGstAmount;
    
    // Get company details
    const itemCompany = selectedItem.company;
    const companyId = selectedItem.companyId;

    const saleItem: SaleItem = {
      itemId: '1',
      companyId: companyId,
      companyName: itemCompany,
      name: selectedItem.name,
      quantity,
      unitPrice: exclusiveCost,
      mrp: mrp,
      salesUnit,
      gstPercentage: gstRate > 0 ? gstRate : undefined,
      gstAmount: itemGstAmount,
      discountValue: discountValue > 0 ? discountValue : undefined,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      totalPrice,
      totalAmount: totalPrice,
      hsnCode: hsnCode || undefined,
      packagingDetails: packagingDetails || undefined,
      godown: selectedItem.godown ? selectedItem.godown.filter(g => g.name === selectedGodown) : []
    };
    try {
      onAddItem(saleItem);
      resetForm();
    } catch (error) {
      toast.error('Error adding item to sale');
      console.error('Error adding item to sale:', error);
    }
  };

  const getItemDisplayDetails = (item: Item) => {
    if (!item) return "";
    const hasBulkPrices = Array.isArray((item as any).bulkPrices) && (item as any).bulkPrices.length > 0;
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {item.name}
            {item.gstPercentage ? ` (GST: ${item.gstPercentage}%)` : ''} - ₹{item.unitPrice}
          </span>
          {hasBulkPrices && (
            <span className="text-xs text-blue-600 ml-2">[Bulk pricing available]</span>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {item.company} | In stock: {item.stockQuantity} {item.salesUnit}
        </div>
        {hasBulkPrices && (
          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
            {(item as any).bulkPrices.map((slab: any, idx: number) => (
              <span key={idx}>
                {slab.range}: ₹{slab.price}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-2">Add Item</h3>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap items-end gap-2 mb-2 overflow-x-auto">
          {/* Item Selection */}
          <div className="w-[350px]">
            <Label htmlFor="item" className="text-xs">Item Name</Label>
            <Popover open={isItemPopoverOpen} onOpenChange={setIsItemPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={isItemPopoverOpen}
                  className="w-full h-8 text-xs justify-between"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsItemPopoverOpen(!isItemPopoverOpen);
                  }}
                >
                  {selectedItem ? selectedItemName : "Select an item"}
                  <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-2">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-[300px] overflow-auto">
                    {filteredSearchItems.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No items found.</div>
                    ) : (
                      filteredSearchItems.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          className="w-full p-2 text-left hover:bg-gray-100 rounded-sm flex items-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedItemName(item.name);
                            setIsItemPopoverOpen(false);
                            setSearchTerm('');
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedItemName === item.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {getItemDisplayDetails(item)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Godown */}
          <div className="w-[180px]">
            <Label htmlFor="godown" className="text-xs">Godown</Label>
            <Select 
              value={selectedGodown} 
              onValueChange={setSelectedGodown}
              disabled={!selectedItem || !selectedItem.godown || selectedItem.godown.length === 0}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select godown" />
              </SelectTrigger>
              <SelectContent>
                {selectedItem?.godown?.map((godown) => (
                  <SelectItem key={godown.name} value={godown.name}>
                    {godown.name} ({godown.quantity})
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quantity */}
          <div className="w-[80px]">
            <Label htmlFor="quantity" className="text-xs">Sale Qty</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setQuantity(value);
              }}
              className="h-8 text-xs"
            />
          </div>
          
          {/* Unit */}
          <div className="w-[80px]">
            <Label htmlFor="salesUnit" className="text-xs">Sale Unit</Label>
            <Select value={salesUnit} onValueChange={setSalesUnit}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {SALES_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit} className="text-xs">
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quantity */}
          {/* <div className="w-[80px]">
            <Label htmlFor="stockQuantity" className="text-xs">Quantity</Label>
            <Input
              id="stockQuantity"
              type="text"
              value={selectedItem?.stockQuantity || ''}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div> */}
          
          {/* MRP
          <div className="w-[80px]">
            <Label htmlFor="mrp" className="text-xs">MRP</Label>
            <Input
              id="mrp"
              type="number"
              min="0"
              step="0.01"
              value={mrp}
              className="h-8 text-xs"
              readOnly
            />
          </div> */}
          
          {/* Excl. GST Rate */}
          <div className="w-[80px]">
            <Label htmlFor="exclusiveCost" className="text-xs">Excl. Rate</Label>
            <Input
              id="exclusiveCost"
              type="number"
              min="0"
              step="0.01"
              value={exclusiveCost}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setExclusiveCost(value);
                // Recalculate GST amount when exclusive cost changes
                const newGstAmount = value * (gstRate / 100) * (quantity || 0);
                setGstAmount(newGstAmount);
              }}
              className="h-8 text-xs"
            />
          </div>
          
          {/* GST Rate */}
          <div className="w-[80px]">
            <Label htmlFor="gstRate" className="text-xs">GST Rate</Label>
            <Input
              id="gstRate"
              type="number"
              value={gstRate}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* GST Amount */}
          <div className="w-[80px]">
            <Label htmlFor="gstAmount" className="text-xs">GST Amt</Label>
            <Input
              id="gstAmount"
              type="number"
              value={Number(gstAmount).toFixed(2)}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* Rate */}
          <div className="w-[80px]">
            <Label htmlFor="totalRate" className="text-xs">Rate</Label>
            <Input
              id="totalRate"
              type="number"
              value={(Number(exclusiveCost) + (Number(exclusiveCost) * Number(gstRate) / 100)).toFixed(2)}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* Per */}
          <div className="w-[120px]">
            <Label htmlFor="per" className="text-xs">Per</Label>
            <Input
              id="per"
              type="text"
              value={salesUnit}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* Amount */}
          <div className="w-[160px]">
            <Label htmlFor="amount" className="text-xs">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={(Number(exclusiveCost) * Number(quantity)).toFixed(2)}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* Discount */}
          <div className="w-[160px]">
            <Label htmlFor="discount" className="text-xs">Disc %</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
          
          {/* Disc */}
          <div className="w-[160px]">
            <Label htmlFor="discAmount" className="text-xs">Disc</Label>
            <Input
              id="discAmount"
              type="number"
              value={(discountType === 'amount' ? Number(discount) : (Number(exclusiveCost) * Number(quantity) * Number(discount) / 100)).toFixed(2)}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* Nett Amount */}
          <div className="w-[200px]">
            <Label htmlFor="nettAmount" className="text-xs">Net Amount</Label>
            <Input
              id="nettAmount"
              type="number"
              value={(Number(exclusiveCost) * Number(quantity) + Number(gstAmount) - (discountType === 'amount' ? Number(discount) : (Number(exclusiveCost) * Number(quantity) * Number(discount) / 100))).toFixed(2)}
              readOnly
              className="bg-gray-50 h-8 text-xs"
            />
          </div>
          
          {/* Add Button */}
          <div className="w-[120px]">
            <Button 
              type="button" 
              onClick={handleAddItem}
              className="h-8 text-xs w-full"
              disabled={!selectedItemName || quantity <= 0}
            >
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
        </div>
        
        {/* Hidden Fields for HSN and Packaging */}
        <div className="hidden">
          <Input id="hsnCode" value={hsnCode} readOnly />
          <Input id="packagingDetails" value={packagingDetails} onChange={(e) => setPackagingDetails(e.target.value)} />
        </div>
        
        {/* Warnings */}
        {company && (company === 'Mansan Laal and Sons' || company === 'Estimate') && (
          <div className="flex items-center p-1 mb-1 text-amber-800 bg-amber-50 rounded border border-amber-200">
            <AlertCircle size={12} className="mr-1" />
            <p className="text-xs">
              {company === 'Mansan Laal and Sons' 
                ? 'Mansan Laal and Sons requires GST items with HSN codes only.'
                : 'Estimate company only accepts Non-GST items.'}
            </p>
          </div>
        )}
      </form>
    </Card>
  );
};

export default ItemEntryForm; 