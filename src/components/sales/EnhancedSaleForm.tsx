import React, { useState, useEffect, useMemo } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useSales } from '../../contexts/SalesContext';
import { Item, SaleItem, Company } from '../../types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Trash2, Printer, FileText, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateExclusiveCost, calculateMRP, calculateFinalPrice } from '../../utils/pricingUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PrintBillModal } from './PrintBillModal';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDown } from 'lucide-react';
import CustomerForm from '../customers/CustomerForm';
import { useCustomers } from '../../contexts/CustomersContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomerInfo from './CustomerInfo';
import ItemEntryForm from './ItemEntryForm';
import SaleItemsTable from './SaleItemsTable';
import CompanySummary from './CompanySummary';
import SaleSummary from './SaleSummary';
import DiscountDialog from './DiscountDialog';
import Loader from '../ui/loader';


// Define sales units
const SALES_UNITS = ['Case', 'Packet', 'Piece'];

// TODO: These will be fetched from backend
// const GST_RATES = [5, 12, 18, 28];
// const HSN_CODES = [
//   '0910', '1101', '1902', '2106', '3004',
//   '3306', '3401', '3402', '3923', '4818',
//   '6911', '7321', '8414', '8418', '8450',
//   '8516', '8517', '8528', '9503'
// ];

// Define type for company summary
interface CompanySummary {
  id: string;
  name: string;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
}

const EnhancedSaleForm: React.FC = () => {
  const { companies, currentCompany, setCurrentCompany } = useCompany();
  const { items } = useInventory();
  const { addSaleItem, currentSaleItems, removeSaleItem, createSale, clearSaleItems, validateCompanyItems, updateSaleItem: contextUpdateSaleItem } = useSales();
  const { groupedCustomers } = useCustomers();
  const { currentUser } = useAuth();

  // Form state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [salesUnit, setSalesUnit] = useState<string>('Piece');
  const [mrp, setMrp] = useState<number>(0);
  const [exclusiveCost, setExclusiveCost] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Discount dialog state
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState<boolean>(false);
  const [discountItemIndex, setDiscountItemIndex] = useState<number>(-1);
  const [dialogDiscount, setDialogDiscount] = useState<number>(0);
  const [dialogDiscountType, setDialogDiscountType] = useState<'amount' | 'percentage'>('amount');

  // Bill modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'single' | 'all' | 'consolidated'>('all');
  const [createdSale, setCreatedSale] = useState<any>(null);
  const [consolidatedPreviewOpen, setConsolidatedPreviewOpen] = useState(false);

  // Summary calculations
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  // Add Customer state
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Add this near the top of the component, after state declarations:
  const itemsToShow = items;
  // Debug logging can be re-enabled if needed
  // console.log(itemsToShow);

  // Restore hsnCode and packagingDetails state
  const [gstRate,setGstRate] = useState<number>(0)
  const [hsnCode,setHsnCode] = useState<string>('')
  const [packagingDetails, setPackagingDetails] = useState<string>('');

  // Add state for customer suggestions popover
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);

  // Filter customers based on input
  const filteredCustomerSuggestions = useMemo(() => {
    if (!customerName.trim()) return [];
    const lower = customerName.toLowerCase();
    
    // Flatten all ledgers from all groups
    return groupedCustomers.flatMap(group => 
      group.ledgers.filter(ledger => 
        ledger.toLowerCase().includes(lower)
      ).map(ledger => ({
        name: ledger,
        group: group.group
      }))
    );
  }, [customerName, groupedCustomers]);

  // Calculate company summaries for the bill
  const companySummaries = useMemo(() => {
    const summaries: Record<string, CompanySummary> = {};

    if (!currentSaleItems || currentSaleItems.length === 0) {
      return summaries;
    }

    currentSaleItems.forEach(item => {
      const companyName = item.companyName;
      if (!companyName) {
        console.warn(`Company name not found for item ${item.name}`);
        return;
      }

      if (!summaries[companyName]) {
        summaries[companyName] = {
          id: companyName, // Using company name as ID
          name: companyName,
          subtotal: 0,
          discount: 0,
          gst: 0,
          total: 0
        };
      }

      const summary = summaries[companyName];
      const baseAmount = item.unitPrice * item.quantity;
      const discountAmount = item.discountValue || 0;
      const gstAmount = item.gstAmount || 0;

      summary.subtotal += baseAmount;
      summary.discount += discountAmount;
      summary.gst += gstAmount;
      summary.total += item.totalPrice;
    });

    return summaries;
  }, [currentSaleItems]);

  // Update filteredSearchItems to remove itemId reference
  const filteredSearchItems = useMemo(() => {
    if (!searchTerm || !itemsToShow || itemsToShow.length === 0) {
      return itemsToShow || [];
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return itemsToShow.filter(item =>
      (item.name && item.name.toLowerCase().includes(lowerSearchTerm)) ||
      (item.hsn && item.hsn.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, itemsToShow]);

  // Set loading state
  useEffect(() => {
    // const hasCompanies = companies && companies.length > 0;
    const hasItems = items && items.length > 0;
    // const hasGodowns = filteredGodowns && filteredGodowns.length > 0;
    
    setIsLoading(!(hasItems));
  }, [companies, items]);

  // Update item details when item selection changes
  useEffect(() => {
    if (selectedItemId && itemsToShow && itemsToShow.length > 0) {
      const item = itemsToShow.find((item) => item.id === selectedItemId);
      if (item) {
        setSelectedItem(item);
        // Set GST rate based on company and item
        setGstRate(item.gstPercentage || 0);
        setHsnCode(item.hsn || '');
        if (item.gstPercentage > 0) {
          if (item.mrp) {
            setMrp(item.mrp);
            const calculatedExclusiveCost = calculateExclusiveCost(item.mrp, item.gstPercentage);
  
            setExclusiveCost(calculatedExclusiveCost);
            const calculatedGstAmount = item.mrp - calculatedExclusiveCost;
            setGstAmount(calculatedGstAmount * quantity);
          } else {
            setExclusiveCost(item.unitPrice);
            const calculatedMrp = calculateMRP(item.unitPrice, item.gstPercentage);
            setMrp(calculatedMrp);
            const calculatedGstAmount = calculatedMrp - item.unitPrice;
            setGstAmount(calculatedGstAmount * quantity);
          }
        } else {
          setExclusiveCost(item.unitPrice);
          setMrp(item.unitPrice);
          setGstAmount(0);
        }
      } else {
        setSelectedItem(null);
        setMrp(0);
        setExclusiveCost(0);
        setGstRate(0);
        setGstAmount(0);
        setHsnCode('');
      }
    } else {
      setSelectedItem(null);
      setMrp(0);
      setExclusiveCost(0);
      setGstRate(0);
      setGstAmount(0);
      setHsnCode('');
    }
  }, [selectedItemId, itemsToShow, quantity]);

  // Handle MRP change
  const handleMrpChange = (value: number) => {
    setMrp(value);
    if (gstRate > 0) {
      const newExclusiveCost = calculateExclusiveCost(value, gstRate);
      setExclusiveCost(newExclusiveCost);
      
      const newGstAmount = value - newExclusiveCost;
      setGstAmount(newGstAmount * quantity);
    } else {
      setExclusiveCost(value);
      setGstAmount(0);
    }
  };
  
  // Handle adding item to bill
  const handleAddItem = () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
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
    const itemCompany = companies?.find(c => c.id === selectedItem.companyId);
    
    // Get company name from the company object or use a default
    const companyName = itemCompany?.name || 'Unknown Company';
    
    const saleItem: SaleItem = {
      itemId: selectedItem.id,
      companyId: selectedItem.companyId,
      companyName: companyName,
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
      godown: selectedItem.godown
    };
    try {
      addSaleItem(saleItem);
      setSelectedItemId('');
      setSelectedItem(null);
      setQuantity(1);
      setDiscount(0);
      setSearchTerm('');
      setIsItemPopoverOpen(false);
    } catch (error) {
      toast.error('Error adding item to sale');
      console.error('Error adding item to sale:', error);
    }
  };
  
  // Open discount dialog for an item
  const openDiscountDialog = (index: number) => {
    if (!currentSaleItems || index < 0 || index >= currentSaleItems.length) {
      toast.error('Invalid item selected');
      return;
    }
    
    const item = currentSaleItems[index];
    
    setDiscountItemIndex(index);
    
    if (item.discountValue) {
      setDialogDiscount(item.discountPercentage ? item.discountPercentage : item.discountValue);
      setDialogDiscountType(item.discountPercentage ? 'percentage' : 'amount');
    } else {
      setDialogDiscount(0);
      setDialogDiscountType('amount');
    }
    
    setIsDiscountDialogOpen(true);
  };
  
  // Apply discount to an item
  const applyItemDiscount = () => {
    if (discountItemIndex < 0 || !currentSaleItems || discountItemIndex >= currentSaleItems.length) return;
    
    const item = currentSaleItems[discountItemIndex];
    const updatedItem = { ...item };
    
    // Calculate discount
    let discountValue = 0;
    let discountPercentage = 0;
    
    const baseAmount = item.unitPrice * item.quantity;
    
    if (dialogDiscount > 0) {
      if (dialogDiscountType === 'amount') {
        discountValue = dialogDiscount;
        discountPercentage = (dialogDiscount / baseAmount) * 100;
      } else {
        discountPercentage = dialogDiscount;
        discountValue = (baseAmount * dialogDiscount) / 100;
      }
    }
    
    // Calculate GST on discounted amount
    const discountedBaseAmount = baseAmount - discountValue;
    let itemGstAmount = 0;
    
    if (item.gstPercentage) {
      itemGstAmount = (discountedBaseAmount * item.gstPercentage) / 100;
    }
    
    // Update item with new values
    updatedItem.discountValue = discountValue > 0 ? discountValue : undefined;
    updatedItem.discountPercentage = discountPercentage > 0 ? discountPercentage : undefined;
    updatedItem.gstAmount = itemGstAmount;
    updatedItem.totalPrice = discountedBaseAmount + itemGstAmount;
    updatedItem.totalAmount = updatedItem.totalPrice;
    
    try {
      // Use the updateSaleItem function from context if available, otherwise fallback
      if (typeof contextUpdateSaleItem === 'function') {
        contextUpdateSaleItem(discountItemIndex, updatedItem);
      } else {
        // This is a fallback in case updateSaleItem isn't provided by the context
        removeSaleItem(discountItemIndex);
        addSaleItem(updatedItem);
      }
      
      setIsDiscountDialogOpen(false);
      toast.success('Discount applied successfully');
    } catch (error) {
      toast.error('Error applying discount');
      console.error('Error applying discount:', error);
    }
  };

  // Calculate summary values whenever sale items change
  useEffect(() => {
    if (!currentSaleItems || currentSaleItems.length === 0) {
      setSubtotal(0);
      setTotalDiscount(0);
      setTotalGst(0);
      setGrandTotal(0);
      return;
    }
    
    let newSubtotal = 0;
    let newTotalDiscount = 0;
    let newTotalGst = 0;
    let newGrandTotal = 0;
    
    currentSaleItems.forEach(item => {
      const baseAmount = item.unitPrice * item.quantity;
      newSubtotal += baseAmount;
      newTotalDiscount += item.discountValue || 0;
      newTotalGst += item.gstAmount || 0;
      newGrandTotal += item.totalPrice;
    });
    
    setSubtotal(newSubtotal);
    setTotalDiscount(newTotalDiscount);
    setTotalGst(newTotalGst);
    setGrandTotal(newGrandTotal);
  }, [currentSaleItems]);
  
  // Handle create sale
  const handleCreateSale = () => {
    if (!currentSaleItems || currentSaleItems.length === 0) {
      toast.error('No items added to sale');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    
    try {
      // Validate company-specific rules
      const validation = validateCompanyItems(currentSaleItems);
      if (!validation.valid) {
        toast.error(validation.errorMessage || 'Invalid items');
        return;
      }
      
      // Group items by company name to create separate bills if needed
      const itemsByCompany: Record<string, SaleItem[]> = {};
      
      currentSaleItems.forEach(item => {
        console.log(item,"in EnhancedSaleForm");
        const companyName = item.companyName;
        if (!companyName) {
          console.warn(`Company name not found for item ${item.name}`);
          return;
        }

        if (!itemsByCompany[companyName]) {
          itemsByCompany[companyName] = [];
        }
        
        itemsByCompany[companyName].push(item);
      });
      
      // Create bills for each company
      const createdSales = [];
      
      for (const [companyName, items] of Object.entries(itemsByCompany)) {
        const company = companies?.find(c => c.name === companyName);
        
        const hasGst = items.some(item => item.gstPercentage && item.gstPercentage > 0);
        
        // Explicitly cast billType to the correct type
        const billType = hasGst ? 'GST' as const : 'NON-GST' as const;
        const billNumber = `${companyName.substring(0, 3).toUpperCase()}-${Date.now()}`; // Generate a bill number with company prefix
        
        const billData = {
          companyId: company?.id || companyName, // Fallback to company name if ID not found
          companyName: companyName,
          billNumber,
          date: new Date().toISOString(),
          customerName,
          billType,
          items,
          totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
          createdBy: currentUser?.name || 'Unknown',
          taxInvoiceNo,
          estimateNo,
          partyAccount,
          customerMobile,
          extraValue,
        };
        
        const sale = createSale(billData);
        if (sale) {
          createdSales.push(sale);
        }
      }
      
      // Clear the form if all sales were created successfully
      if (createdSales.length > 0) {
        setCreatedSale(createdSales);
        clearSaleItems();
        setCustomerName('');
        setSelectedItemId('');
        setSelectedItem(null);
        setQuantity(1);
        setSalesUnit('Piece');
        setMrp(0);
        setExclusiveCost(0);
        setGstAmount(0);
        setDiscount(0);
        setDiscountType('amount');
        setSearchTerm('');
        setIsPrintModalOpen(true);
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Failed to create sale');
    }
  };
  
  // Handle preview consolidated bill
  const handlePreviewConsolidatedBill = () => {
    if (!currentSaleItems || currentSaleItems.length === 0) {
      toast.error('No items added to sale');
      return;
    }
    
    setConsolidatedPreviewOpen(true);
  };

  // Add dummy onAddCustomer function
  const handleAddCustomer = () => {
    toast.info('Customer management is now handled through ledgers');
  };

  const getItemDisplayDetails = (item: Item) => {
    if (!item) return "";
    const company = companies.find(c => c.id === item.companyId);
    const hasBulkPrices = Array.isArray((item as any).bulkPrices) && (item as any).bulkPrices.length > 0;
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {item.name}
            {item.gstPercentage ? ` (GST: ${item.gstPercentage}%)` : ''} - ₹{item.unitPrice}
          </span>
          {/* Bulk pricing link if available */}
          {hasBulkPrices && (
            <span className="text-xs text-blue-600 ml-2">[Bulk pricing available]</span>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {company ? company.name : 'Unknown Company'} | In stock: {item.stockQuantity} {item.salesUnit}
        </div>
        {/* Bulk pricing slabs if available */}
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

  // Add updateSaleItem if it doesn't exist in the context
  const updateSaleItem = (index: number, saleItem: SaleItem) => {
    if (typeof contextUpdateSaleItem === 'function') {
      contextUpdateSaleItem(index, saleItem);
      return;
    }
    
    // Fallback implementation
    try {
      const newItems = [...currentSaleItems];
      newItems[index] = saleItem;
      
      // Remove and add to simulate update
      removeSaleItem(index);
      addSaleItem(saleItem);
    } catch (error) {
      console.error('Error updating sale item:', error);
      toast.error('Failed to update item');
    }
  };

  // Update the item selection handler to be robust
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    const item = itemsToShow.find(i => i.id === itemId);
    setSelectedItem(item || null);
    if (item) {
      // Auto-select the company for the selected item
      const company = companies.find(c => c.id === item.companyId);
      if (company) {
        setCurrentCompany(company);
      }
    }
  };

  // Remove popover/ref/focus logic for customer name input
  const [customerNameInputFocused, setCustomerNameInputFocused] = useState(false);

  // Add state for tax invoice and estimate number
  const [taxInvoiceNo, setTaxInvoiceNo] = useState<string>('');
  const [estimateNo, setEstimateNo] = useState<string>('');
  
  // Add state for party account, customer mobile and extra value
  const [partyAccount, setPartyAccount] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [extraValue, setExtraValue] = useState<string>('');
  
  // Mock party accounts data - this would come from backend in a real application
  const mockPartyAccounts = useMemo(() => [
    { id: 'cash', name: 'Cash' },
    { id: 'credit', name: 'Credit' },
    { id: 'bank', name: 'Bank' },
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <Loader />
   
    )

  }

  return (
    <div className="space-y-6">
      <CustomerInfo
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        onAddCustomer={handleAddCustomer}
        taxInvoiceNo={taxInvoiceNo}
        onTaxInvoiceNoChange={setTaxInvoiceNo}
        estimateNo={estimateNo}
        onEstimateNoChange={setEstimateNo}
        partyAccount={partyAccount}
        onPartyAccountChange={setPartyAccount}
        customerMobile={customerMobile}
        onCustomerMobileChange={setCustomerMobile}
        extraValue={extraValue}
        onExtraValueChange={setExtraValue}
        partyAccounts={mockPartyAccounts}
      />
      
      <ItemEntryForm
        onAddItem={addSaleItem}
        companies={companies || []}
        items={items || []}
      />
      
      <SaleItemsTable
        items={currentSaleItems}
        onRemoveItem={removeSaleItem}
        onOpenDiscountDialog={openDiscountDialog}
      />
      
      <CompanySummary summaries={companySummaries} />
      
      <SaleSummary
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        totalGst={totalGst}
        grandTotal={grandTotal}
        onCreateSale={handleCreateSale}
        onPreviewBill={handlePreviewConsolidatedBill}
        onClearItems={clearSaleItems}
        isDisabled={currentSaleItems.length === 0 || !customerName}
      />

      <DiscountDialog
        isOpen={isDiscountDialogOpen}
        onClose={() => setIsDiscountDialogOpen(false)}
        onApply={applyItemDiscount}
        discount={dialogDiscount}
        onDiscountChange={setDialogDiscount}
        discountType={dialogDiscountType}
        onDiscountTypeChange={setDialogDiscountType}
      />

      {isPrintModalOpen && createdSale && (
        <PrintBillModal 
          isOpen={isPrintModalOpen} 
          onClose={() => setIsPrintModalOpen(false)} 
          sale={createdSale} 
          printType={printType}
        />
      )}
    </div>
  );
};

export default EnhancedSaleForm;