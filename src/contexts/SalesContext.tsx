import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale, SaleItem } from '../types';
import { sales as mockSales, generateId, generateBillNumber } from '../data/mockData';
import { useCompany } from './CompanyContext';
import { useInventory } from './InventoryContext';
import { toast } from 'sonner';
import { formatInventoryItemForBilling } from '../utils/inventoryUtils';

interface SalesContextType {
  sales: Sale[];
  filteredSales: Sale[];
  gstSales: Sale[];
  nonGstSales: Sale[];
  currentSaleItems: SaleItem[];
  addSaleItem: (saleItem: SaleItem) => void;
  updateSaleItem: (index: number, saleItem: SaleItem) => void;
  removeSaleItem: (index: number) => void;
  clearSaleItems: () => void;
  createSale: (saleData: Omit<Sale, 'id' | 'createdAt'>) => Sale | undefined;
  getSale: (id: string) => Sale | undefined;
  validateCompanyItems: (items: SaleItem[]) => { valid: boolean; errorMessage?: string };
  getAllSales: () => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [gstSales, setGstSales] = useState<Sale[]>([]);
  const [nonGstSales, setNonGstSales] = useState<Sale[]>([]);
  const [currentSaleItems, setCurrentSaleItems] = useState<SaleItem[]>([]);
  
  const { currentCompany, companies } = useCompany();
  const { items } = useInventory();

  // Filter sales based on current company
  useEffect(() => {
    if (!sales) return;
    
    if (currentCompany) {
      const companySales = sales.filter(sale => sale.companyId === currentCompany.id);
      setFilteredSales(companySales);
      setGstSales(companySales.filter(sale => sale.billType === 'GST'));
      setNonGstSales(companySales.filter(sale => sale.billType === 'NON-GST'));
    } else {
      // If no company is selected, show all sales
      setFilteredSales(sales);
      setGstSales(sales.filter(sale => sale.billType === 'GST'));
      setNonGstSales(sales.filter(sale => sale.billType === 'NON-GST'));
    }
  }, [currentCompany, sales]);

  const addSaleItem = (saleItem: SaleItem) => {
    try {
      // Format the item for billing
      const formattedItem = formatInventoryItemForBilling(saleItem);
      
      // Validate company-specific rules
      if (formattedItem.companyName === 'Mansan Laal and Sons' && !formattedItem.gstPercentage) {
        toast.error('Mansan Laal and Sons requires GST items only');
        return;
      }
      
      if (formattedItem.companyName === 'Estimate' && formattedItem.gstPercentage) {
        toast.error('Estimate company only accepts Non-GST items');
        return;
      }
      
      // HSN code validation for GST items of Mansan Laal
      if (formattedItem.companyName === 'Mansan Laal and Sons' && !formattedItem.hsnCode) {
        toast.error('HSN Code is required for Mansan Laal and Sons items');
        return;
      }
      
      // Preserve original quantity, discount and other properties
      const finalItem = {
        ...formattedItem,
        quantity: saleItem.quantity,
        discountValue: saleItem.discountValue,
        discountPercentage: saleItem.discountPercentage,
        totalPrice: saleItem.totalPrice,
        totalAmount: saleItem.totalAmount,
      };
      
      // --- CORRECTION: Always add a new row for each item, even if itemId and companyId are the same ---
      setCurrentSaleItems(prev => [...prev, finalItem]);
      // --- END CORRECTION ---
    } catch (error) {
      console.error("Error adding sale item:", error);
      toast.error("Failed to add item");
    }
  };

  const updateSaleItem = (index: number, saleItem: SaleItem) => {
    try {
      // Validate company-specific rules
      if (saleItem.companyName === 'Mansan Laal and Sons' && !saleItem.gstPercentage) {
        toast.error('Mansan Laal and Sons requires GST items only');
        return;
      }
      
      if (saleItem.companyName === 'Estimate' && saleItem.gstPercentage) {
        toast.error('Estimate company only accepts Non-GST items');
        return;
      }
      
      // HSN code validation for GST items of Mansan Laal
      if (saleItem.companyName === 'Mansan Laal and Sons' && !saleItem.hsnCode) {
        toast.error('HSN Code is required for Mansan Laal and Sons items');
        return;
      }
      
      // Validate MRP = Excl. Cost + GST for GST items
      if (saleItem.gstPercentage && saleItem.mrp) {
        const calculatedMRP = saleItem.unitPrice * (1 + saleItem.gstPercentage / 100);
        if (Math.abs(calculatedMRP - saleItem.mrp) > 0.01) { // Allow small rounding difference
          toast.error(`MRP should be equal to Excl. Cost + GST (${calculatedMRP.toFixed(2)})`);
          return;
        }
      }
      
      const updatedItems = [...currentSaleItems];
      
      // Validate index is within bounds
      if (index < 0 || index >= updatedItems.length) {
        toast.error('Invalid item index');
        return;
      }
      
      updatedItems[index] = saleItem;
      setCurrentSaleItems(updatedItems);
    } catch (error) {
      console.error("Error updating sale item:", error);
      toast.error("Failed to update item");
    }
  };

  const removeSaleItem = (index: number) => {
    try {
      const updatedItems = [...currentSaleItems];
      
      // Validate index is within bounds
      if (index < 0 || index >= updatedItems.length) {
        toast.error('Invalid item index');
        return;
      }
      
      updatedItems.splice(index, 1);
      setCurrentSaleItems(updatedItems);
    } catch (error) {
      console.error("Error removing sale item:", error);
      toast.error("Failed to remove item");
    }
  };

  const clearSaleItems = () => {
    setCurrentSaleItems([]);
  };

  const validateCompanyItems = (items: SaleItem[]): { valid: boolean; errorMessage?: string } => {
    try {
      if (!items || items.length === 0) {
        return { valid: false, errorMessage: 'No items to validate' };
      }
      
      // Group items by company
      const itemsByCompany: Record<string, SaleItem[]> = {};
      
      items.forEach(item => {
        if (!itemsByCompany[item.companyId]) {
          itemsByCompany[item.companyId] = [];
        }
        itemsByCompany[item.companyId].push(item);
      });
      
      // Check each company's items
      for (const [companyId, companyItems] of Object.entries(itemsByCompany)) {
        const company = companies?.find(c => c.id === companyId);
        if (!company) continue;
        
        // Special validation for Mansan Laal
        if (company.name === 'Mansan Laal and Sons') {
          // All items must be GST items
          const nonGstItems = companyItems.filter(item => item.gstPercentage === undefined || item.gstPercentage === 0);
          if (nonGstItems.length > 0) {
            return {
              valid: false,
              errorMessage: 'Mansan Laal and Sons requires GST items only'
            };
          }
          
          // All items must have HSN code
          const missingHsnItems = companyItems.filter(item => !item.hsnCode);
          if (missingHsnItems.length > 0) {
            return {
              valid: false,
              errorMessage: 'HSN Code is required for all Mansan Laal and Sons items'
            };
          }
        }
        
        // Special validation for Estimate
        if (company.name === 'Estimate') {
          // All items must be Non-GST items
          const gstItems = companyItems.filter(item => item.gstPercentage !== undefined && item.gstPercentage > 0);
          if (gstItems.length > 0) {
            return {
              valid: false,
              errorMessage: 'Estimate company only accepts Non-GST items'
            };
          }
        }
        
        // General validation - no mixing of GST and Non-GST items
        const hasGst = companyItems.some(item => item.gstPercentage !== undefined && item.gstPercentage > 0);
        const allHaveGst = companyItems.every(item => item.gstPercentage !== undefined && item.gstPercentage > 0);
        const noneHaveGst = companyItems.every(item => item.gstPercentage === undefined || item.gstPercentage === 0);
        
        if (hasGst && !allHaveGst && !noneHaveGst) {
          return {
            valid: false,
            errorMessage: `${company.name} cannot have mixed GST/Non-GST items`
          };
        }
        
        // Validate MRP = Excl. Cost + GST for all GST items
        for (const item of companyItems) {
          if (item.gstPercentage !== undefined && item.gstPercentage > 0 && item.mrp) {
            const calculatedMRP = item.unitPrice * (1 + item.gstPercentage / 100);
            if (Math.abs(calculatedMRP - item.mrp) > 0.01) { // Allow small rounding difference
              return {
                valid: false,
                errorMessage: `Item ${item.name}: MRP should be equal to Excl. Cost + GST (${calculatedMRP.toFixed(2)})`
              };
            }
          }
        }
      }
      
      return { valid: true };
    } catch (error) {
      console.error("Error validating items:", error);
      return { valid: false, errorMessage: 'Validation error occurred' };
    }
  };

  const createSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      if (!saleData.items || saleData.items.length === 0) {
        toast.error('No items in sale');
        return undefined;
      }
      
      // Validate company-specific rules
      const validation = validateCompanyItems(saleData.items);
      if (!validation.valid) {
        toast.error(validation.errorMessage || 'Invalid items');
        return undefined;
      }
      
      // Calculate total amount if not provided
      const totalAmount = saleData.totalAmount || saleData.items.reduce(
        (total, item) => total + item.totalAmount,
        0
      );
      
      // Generate new sale
      const newSale: Sale = {
        ...saleData,
        id: generateId(),
        billNumber: saleData.billNumber || generateBillNumber(saleData.billType === 'GST' ? 'GST' : 'NON'),
        totalAmount,
        createdAt: new Date().toISOString(),
      };
      
      // Note: Stock update is currently disabled
      // In a future update, implement proper stock management with the updateStock function
      
      // Add sale to list
      setSales(prev => [...prev, newSale]);
      
      toast.success('Sale created successfully');
      
      return newSale;
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error("Failed to create sale");
      return undefined;
    }
  };

  const getSale = (id: string) => {
    try {
      return sales.find(sale => sale.id === id);
    } catch (error) {
      console.error("Error getting sale:", error);
      toast.error("Failed to retrieve sale information");
      return undefined;
    }
  };
  
  const getAllSales = () => {
    return sales;
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        filteredSales,
        gstSales,
        nonGstSales,
        currentSaleItems,
        addSaleItem,
        updateSaleItem,
        removeSaleItem,
        clearSaleItems,
        createSale,
        getSale,
        validateCompanyItems,
        getAllSales,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextType => {
  const context = useContext(SalesContext);
  
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  
  return context;
};
