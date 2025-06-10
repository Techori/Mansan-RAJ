import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale, SaleItem } from '../types';
import { sales as mockSales, generateId, generateBillNumber } from '../data/mockData';
import { formatInventoryItemForBilling } from '../utils/inventoryUtils';
import { toast } from 'sonner';

// Storage key for localStorage
const SALES_STORAGE_KEY = 'app_sales_data';

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
  // Initialize sales from localStorage or fallback to mockSales
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const savedSales = localStorage.getItem(SALES_STORAGE_KEY);
      //to get previous sales obtained frlom local storage
      console.log("savedSales", savedSales)
      return savedSales ? JSON.parse(savedSales) : mockSales;
    } catch (error) {
      console.error('Error loading sales from localStorage:', error);
      return mockSales;
    }
  });

  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [gstSales, setGstSales] = useState<Sale[]>([]);
  const [nonGstSales, setNonGstSales] = useState<Sale[]>([]);
  const [currentSaleItems, setCurrentSaleItems] = useState<SaleItem[]>([]);

  // Save sales to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales to localStorage:', error);
    }
  }, [sales]);

  // Filter sales based on type
  useEffect(() => {
    if (!sales) return;
    setFilteredSales(sales);
    setGstSales(sales.filter(sale => sale.billType === 'GST'));
    setNonGstSales(sales.filter(sale => sale.billType === 'NON-GST'));
  }, [sales]);

  const addSaleItem = (saleItem: SaleItem) => {
    try {
      console.log("saleItem", saleItem)
      const formattedItem = formatInventoryItemForBilling(saleItem);
      console.log("formattedItem", formattedItem)

      const finalItem = {
        ...formattedItem,
        quantity: saleItem.quantity,
        discountValue: saleItem.discountValue,
        discountPercentage: saleItem.discountPercentage,
        totalPrice: saleItem.totalPrice,
        totalAmount: saleItem.totalAmount,
      };
      setCurrentSaleItems(prev => [...prev, finalItem]);
    } catch (error) {
      console.error("Error adding sale item:", error);
      toast.error("Failed to add item");
    }
  };

  const updateSaleItem = (index: number, saleItem: SaleItem) => {
    try {
      // Validate company-specific rules
      if (saleItem.companyName === 'Mansan Raj Traders' && !saleItem.gstPercentage) {
        toast.error('Mansan Raj Traders requires GST items only');
        return;
      }

      if (saleItem.companyName === 'Estimate' && saleItem.gstPercentage) {
        toast.error('Estimate company only accepts Non-GST items');
        return;
      }

      // HSN code validation for GST items of Mansan Laal
      if (saleItem.companyName === 'Mansan Raj Traders' && !saleItem.hsnCode) {
        toast.error('HSN Code is required for Mansan Raj Traders items');
        return;
      }

      const updatedItems = [...currentSaleItems];
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

  const validateCompanyItems = (items: SaleItem[]) => {
    try {
      if (!items || items.length === 0) {
        return { valid: false, errorMessage: 'No items to validate' };
      }

      // Group items by company
      const itemsByCompany: Record<string, SaleItem[]> = {};
      items.forEach(item => {
        if (!item.companyName) {
          return {
            valid: false,
            errorMessage: 'Company name is required for all items'
          };
        }

        if (!itemsByCompany[item.companyName]) {
          itemsByCompany[item.companyName] = [];
        }
        itemsByCompany[item.companyName].push(item);
      });

      // Check each company's items
      for (const [companyName, items] of Object.entries(itemsByCompany)) {
        // Special validation for Mansan Raj Traders
        if (companyName === 'Mansan Raj Traders') {
          // All items must have HSN code
          const missingHsnItems = items.filter(item => !item.hsnCode);
          if (missingHsnItems.length > 0) {
            return {
              valid: false,
              errorMessage: 'HSN Code is required for all Mansan Raj Traders items'
            };
          }
        }

        // Special validation for Estimate
        if (companyName === 'Estimate') {
          // All items must be Non-GST items
          const gstItems = items.filter(item => item.gstPercentage && item.gstPercentage > 0);
          if (gstItems.length > 0) {
            return {
              valid: false,
              errorMessage: 'Estimate company only accepts Non-GST items'
            };
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

  const value: SalesContextType = {
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
  };

  return (
    <SalesContext.Provider value={value}>
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
