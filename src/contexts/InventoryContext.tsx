import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Item, Godown } from '../types';
import { useCompany } from './CompanyContext';
import { toast } from 'sonner';
import axios from '@/lib/axios';

interface InventoryContextType {
  items: Item[];
  godowns: Godown[];
  filteredItems: Item[];
  filteredGodowns: Godown[];
  // getItemsByCompany: (companyId: string) => Item[];
  // getGodownsByCompany: (companyId: string) => Godown[];
  getAllItems: () => Item[];
  isLoading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCompany } = useCompany();
  
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filteredGodowns, setFilteredGodowns] = useState<Godown[]>([]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await axios.post('/api/tally/stocks/fetch-items');
      console.log("result",result.data)
      
      if (!result.data) {
        throw new Error('No data received from server');
      }


      const mappedItems: Item[] = result.data.map((item: any, index: number) => ({
        id: item.id || item.itemId || `${item.item_name}-${index}`,
        name: item.item_name,
        stockQuantity: item.stock_quantity || 0,
        unitPrice: parseFloat(item.standard_price) || 0,
        hsn: item.hsn_code,
        gstPercentage: item.gst_details?.igst_rate ? parseFloat(item.gst_details.igst_rate) : 0,
        mrp: item.mrp_rate,
        godown: item.godowns || [],
        company: item.company_name || '',
        companyId: item.companyId || '',
        salesUnit: item.salesUnit || 'Piece',
        createdAt: item.createdAt || new Date().toISOString(),
        rateAfterGst: 0,
        priceList : item.price_level_list || []
      }));

      
      
      setGodowns(result.data.godowns || []);
      setItems(mappedItems);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch inventory items';
      console.error('Error fetching items:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (currentCompany) {
      setFilteredItems(items.filter(item => item.companyId === currentCompany.id));
    } else {
      setFilteredItems(items);
      setFilteredGodowns(godowns);
    }
  }, [currentCompany, items, godowns]);

  const getAllItems = (): Item[] => {
    return items;
  };

  const updateStock = (itemId: string, quantity: number, salesUnit?: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let adjustedQuantity = quantity;
          
          // If salesUnit is provided and different from the item's unit, adjust quantity accordingly
          if (salesUnit && salesUnit !== item.salesUnit) {
            // Define conversion rates between units
            const conversionRates: Record<string, Record<string, number>> = {
              'Case': {
                'Packet': 12, // 1 Case = 12 Packets
                'Piece': 144, // 1 Case = 144 Pieces
              },
              'Packet': {
                'Case': 1/12, // 1 Packet = 1/12 Cases
                'Piece': 12, // 1 Packet = 12 Pieces
              },
              'Piece': {
                'Case': 1/144, // 1 Piece = 1/144 Cases
                'Packet': 1/12, // 1 Piece = 1/12 Packets
              }
            };
            
            // Get conversion rate
            const conversionRate = conversionRates[salesUnit][item.salesUnit];
            
            // Apply conversion
            adjustedQuantity = quantity * conversionRate;
          }
          
          const newStockQuantity = item.stockQuantity - adjustedQuantity;
          
          // For return items (negative quantity), we always allow the operation
          // For sales (positive quantity), check if enough stock is available
          if (adjustedQuantity > 0 && newStockQuantity < 0) {
            toast.error(`Not enough stock for ${item.name}`);
            return item;
          }
          
          return { ...item, stockQuantity: newStockQuantity };
        }
        return item;
      })
    );
    
    // Show success message for returns (when quantity is negative)
    if (quantity < 0) {
      const item = items.find(item => item.id === itemId);
      if (item) {
        toast.success(`Stock updated for ${item.name}`);
      }
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        godowns,
        filteredItems,
        filteredGodowns,
        getAllItems,
        isLoading,
        error
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  
  return context;
};
