import React, { useState, useEffect, useMemo } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useSales } from '../../contexts/SalesContext';
import { SaleItem } from '../../types';
import { toast } from 'sonner';
import { PrintBillModal } from './PrintBillModal';
import { useCustomers } from '../../contexts/CustomersContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomerInfo from './CustomerInfo';
import ItemEntryForm from './ItemEntryForm';
import SaleItemsTable from './SaleItemsTable';
import CompanySummary from './CompanySummary';
import SaleSummary from './SaleSummary';
import DiscountDialog from './DiscountDialog';
import Loader from '../ui/loader';
import axios from '@/lib/axios';

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
  const { items } = useInventory();
  const { addSaleItem, currentSaleItems, removeSaleItem, createSale, clearSaleItems, validateCompanyItems, updateSaleItem: contextUpdateSaleItem } = useSales();
  const { groupedCustomers } = useCustomers();
  const { currentUser } = useAuth();

  // Form state
  const [customerName, setCustomerName] = useState<string>('');
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

  // Additional form fields
  const [taxInvoiceNo, setTaxInvoiceNo] = useState<string>('');
  const [estimateNo, setEstimateNo] = useState<string>('');
  const [priceLevel, setPriceLevel] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [extraValue, setExtraValue] = useState<string>('');

  // Loader and sale status state
  const [loading, setLoading] = useState(false);
  const [saleStatus, setSaleStatus] = useState<null | 'success' | 'rejected'>(null);

  // Form reset key
  const [formResetKey, setFormResetKey] = useState(0);

  // Set loading state
  useEffect(() => {
    const hasItems = items && items.length > 0;
    setIsLoading(!hasItems);
  }, [items]);

  // Calculate company summaries for the bill
  const companySummaries = useMemo(() => {
    const summaries: Record<string, CompanySummary> = {};

    if (!currentSaleItems || currentSaleItems.length === 0) {
      return summaries;
    }

    currentSaleItems.forEach(item => {
      console.log("item", item)
      const companyName = item.companyName;
      if (!companyName) {
        console.warn(`Company name not found for item ${item.name}`);
        return;
      }

      if (!summaries[companyName]) {
        summaries[companyName] = {
          id: companyName,
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
      if (typeof contextUpdateSaleItem === 'function') {
        contextUpdateSaleItem(discountItemIndex, updatedItem);
      } else {
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
  const handleCreateSale = async () => {
    if (!currentSaleItems || currentSaleItems.length === 0) {
      toast.error('No items added to sale');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    console.log("currentSaleItems", currentSaleItems)

    setLoading(true);
    setSaleStatus(null);
    try {
      const validation = validateCompanyItems(currentSaleItems);
      if (!validation.valid) {
        toast.error(validation.errorMessage || 'Invalid items');
        return;
      }

      // Group items by company name
      const itemsByCompany: Record<string, SaleItem[]> = {};
      currentSaleItems.forEach(item => {
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
        const hasGst = items.some(item => item.gstPercentage && item.gstPercentage > 0);
        const billType = hasGst ? 'GST' as const : 'NON-GST' as const;
        const billNumber = `${companyName.substring(0, 3).toUpperCase()}-${Date.now()}`;

        const billData = {
          companyName,
          billNumber,
          date: new Date().toISOString(),
          customerName,
          billType,
          items,
          totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
          createdBy: currentUser?.name || 'Unknown',
          taxInvoiceNo,
          estimateNo,
          priceLevel,
          customerMobile,
        };

        //TO-Do add price level to the bill (Retail, Wholesale, Semi-Wholesale)
        //TO-Do mock voucher no..
        //TO-Do customer name
        //TO-DO items should be shown in items array
        //TO-Do implement selected godown
        //TO-Do for all items, give base units
        //TO-Do billed quantity
        //TO-Do billed units
        //TO-Do add drop down entries for all units
        //TO-Do

        const sale = createSale(billData);
        if (sale) {
          createdSales.push(sale);
        }
      }

      console.log("createdSales", createdSales)
      //call api
      try {
        const promises = createdSales.map(sale =>
          axios.post('/api/tally/sales/create-sale', sale)
        );
        const results = await Promise.all(promises);
        setLoading(false);
        let allSuccess = true;
        results.forEach(res => {
          console.log("frontend", res.data);
          if (res.data.createdCount !== 1) {
            allSuccess = false;
          }
        });
        if (allSuccess) {
          setSaleStatus('success');
          setCreatedSale(createdSales);
          clearSaleItems();
          setCustomerName('');
          setTaxInvoiceNo('');
          setEstimateNo('');
          setPriceLevel('');
          setCustomerMobile('');
          setExtraValue('');
          setIsPrintModalOpen(true);
          toast.success('Sale created successfully');
        } else {
          setSaleStatus('rejected');
          setCreatedSale(null);
          setIsPrintModalOpen(false);
          clearSaleItems();
          setFormResetKey(prev => prev + 1);
          toast.error('Sales failed');
        }
      } catch (err) {
        setLoading(false);
        setSaleStatus('rejected');
        setCreatedSale(null);
        setIsPrintModalOpen(false);
        console.log('Error creating sales to tally', err.message)
      }
    } catch (error) {
      setLoading(false);
      setSaleStatus('rejected');
      setCreatedSale(null);
      setIsPrintModalOpen(false);
      console.error('Error creating sale:', error);
      toast.error('Failed to create sale');
    }
  };

  // Mock price levels data
  const mockPriceLevels = useMemo(() => [
    { id: 'Retail', name: 'Retail' },
    { id: 'Wholesale', name: 'Wholesale' },
    { id: 'Semi-Wholesale', name: 'Semi-Wholesale' },
  ], []);

  if (isLoading || loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <CustomerInfo
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        onAddCustomer={() => toast.info('Customer management is now handled through ledgers')}
        taxInvoiceNo={taxInvoiceNo}
        onTaxInvoiceNoChange={setTaxInvoiceNo}
        estimateNo={estimateNo}
        onEstimateNoChange={setEstimateNo}
        priceLevel={priceLevel}
        onPriceLevelChange={setPriceLevel}
        customerMobile={customerMobile}
        onCustomerMobileChange={setCustomerMobile}
        extraValue={extraValue}
        onExtraValueChange={setExtraValue}
        priceLevels={mockPriceLevels}
      />

      <ItemEntryForm
        key={formResetKey}
        onAddItem={addSaleItem}
        items={items || []}
        currentUser={currentUser}
      />

      <SaleItemsTable
        key={formResetKey}
        items={currentSaleItems}
        onRemoveItem={removeSaleItem}
        onOpenDiscountDialog={(index) => {
          setDiscountItemIndex(index);
          const item = currentSaleItems[index];
          setDialogDiscount(item.discountPercentage || item.discountValue || 0);
          setDialogDiscountType(item.discountPercentage ? 'percentage' : 'amount');
          setIsDiscountDialogOpen(true);
        }}
      />

      <CompanySummary summaries={companySummaries} />

      <SaleSummary
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        totalGst={totalGst}
        grandTotal={grandTotal}
        onCreateSale={handleCreateSale}
        onPreviewBill={() => setConsolidatedPreviewOpen(true)}
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

      {saleStatus === 'rejected' && <div className="text-red-500 text-center font-bold">Sales Rejected</div>}
    </div>
  );
};

export default EnhancedSaleForm;